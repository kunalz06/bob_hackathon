const fs = require('fs').promises;
const path = require('path');
const { StorageError } = require('../utils/errors');
const { PATHS } = require('../config/constants');

/**
 * Storage service for managing JSON file operations
 * Provides safe file operations with path validation and error handling
 */

/**
 * Sanitize and validate file path to prevent directory traversal
 * @param {string} filePath - Path to sanitize
 * @returns {string} Sanitized absolute path
 * @throws {StorageError} If path is invalid or attempts traversal
 */
function sanitizePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new StorageError('Invalid file path provided');
  }

  // Resolve to absolute path and normalize
  const resolvedPath = path.resolve(filePath);
  const projectRoot = path.resolve('.');

  // Prevent directory traversal outside project
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new StorageError('Path traversal detected - access denied');
  }

  return resolvedPath;
}

/**
 * Ensure directory exists, create if necessary
 * @param {string} dirPath - Directory path
 * @returns {Promise<void>}
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new StorageError(`Failed to create directory: ${error.message}`);
  }
}

/**
 * Ensure data directory and files exist
 */
async function ensureDataFiles() {
  try {
    // Create data directory if it doesn't exist
    await ensureDirectory(PATHS.DATA_DIR);

    // Create blueprints.json if it doesn't exist
    try {
      await fs.access(PATHS.BLUEPRINTS_FILE);
    } catch {
      await fs.writeFile(PATHS.BLUEPRINTS_FILE, JSON.stringify([], null, 2));
    }

    // Create artifacts.json if it doesn't exist
    try {
      await fs.access(PATHS.ARTIFACTS_FILE);
    } catch {
      await fs.writeFile(PATHS.ARTIFACTS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    throw new StorageError(`Failed to initialize data files: ${error.message}`);
  }
}

/**
 * Read JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<any>} Parsed JSON data
 * @throws {StorageError} If file read or parse fails
 */
async function readJSON(filePath) {
  const safePath = sanitizePath(filePath);

  try {
    const data = await fs.readFile(safePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array for consistency
      return [];
    }
    if (error instanceof SyntaxError) {
      throw new StorageError(`Invalid JSON in file ${filePath}`);
    }
    throw new StorageError(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Write JSON data to a file atomically with backup
 * @param {string} filePath - Path to the JSON file
 * @param {any} data - Data to write
 * @returns {Promise<void>}
 * @throws {StorageError} If write fails
 */
async function writeJSON(filePath, data) {
  const safePath = sanitizePath(filePath);
  const tempPath = `${safePath}.tmp`;
  const backupPath = `${safePath}.backup`;

  try {
    // Ensure directory exists
    const dir = path.dirname(safePath);
    await ensureDirectory(dir);

    // Validate data can be stringified
    if (data === undefined || data === null) {
      throw new Error('Data cannot be null or undefined');
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    
    // Validate JSON is valid by parsing it back
    JSON.parse(jsonString);

    // Create backup of existing file if it exists
    try {
      await fs.access(safePath);
      await fs.copyFile(safePath, backupPath);
    } catch {
      // File doesn't exist yet, no backup needed
    }

    // Write atomically using temp file
    await fs.writeFile(tempPath, jsonString, 'utf-8');
    
    // Verify temp file was written correctly
    const writtenData = await fs.readFile(tempPath, 'utf-8');
    JSON.parse(writtenData); // Validate it's valid JSON
    
    // Atomic rename
    await fs.rename(tempPath, safePath);
    
    // Clean up backup after successful write
    try {
      await fs.unlink(backupPath);
    } catch {
      // Backup cleanup failed, but write succeeded
    }
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {
      // Temp file cleanup failed or doesn't exist
    }
    
    // Restore from backup if write failed
    try {
      await fs.access(backupPath);
      await fs.copyFile(backupPath, safePath);
      await fs.unlink(backupPath);
    } catch {
      // No backup to restore or restore failed
    }
    
    throw new StorageError(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Read all blueprints
 * @returns {Promise<Array>} Array of blueprints
 */
async function readBlueprints() {
  await ensureDataFiles();
  return await readJSON(PATHS.BLUEPRINTS_FILE);
}

/**
 * Read blueprint by ID
 * @param {string} id - Blueprint ID
 * @returns {Promise<Object|null>} Blueprint or null if not found
 */
async function readBlueprintById(id) {
  const blueprints = await readBlueprints();
  return blueprints.find(bp => bp.id === id || bp.projectId === id) || null;
}

/**
 * Save a new blueprint
 * @param {Object} blueprint - Blueprint to save
 * @returns {Promise<Object>} Saved blueprint
 */
async function saveBlueprint(blueprint) {
  const blueprints = await readBlueprints();
  blueprints.push(blueprint);
  await writeJSON(PATHS.BLUEPRINTS_FILE, blueprints);
  return blueprint;
}

/**
 * Update an existing blueprint
 * @param {string} id - Blueprint ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object|null>} Updated blueprint or null if not found
 */
async function updateBlueprint(id, updates) {
  const blueprints = await readBlueprints();
  const index = blueprints.findIndex(bp => bp.id === id || bp.projectId === id);
  
  if (index === -1) {
    return null;
  }

  blueprints[index] = {
    ...blueprints[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await writeJSON(PATHS.BLUEPRINTS_FILE, blueprints);
  return blueprints[index];
}

/**
 * Delete a blueprint
 * @param {string} id - Blueprint ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteBlueprint(id) {
  const blueprints = await readBlueprints();
  const filtered = blueprints.filter(bp => bp.id !== id && bp.projectId !== id);
  
  if (filtered.length === blueprints.length) {
    return false;
  }

  await writeJSON(PATHS.BLUEPRINTS_FILE, filtered);
  return true;
}

/**
 * Read all artifacts
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function readArtifacts(projectId = null) {
  await ensureDataFiles();
  const artifacts = await readJSON(PATHS.ARTIFACTS_FILE);
  
  if (projectId) {
    return artifacts.filter(a => a.projectId === projectId);
  }
  
  return artifacts;
}

/**
 * Read artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object|null>} Artifact or null if not found
 */
async function readArtifactById(id) {
  const artifacts = await readArtifacts();
  return artifacts.find(a => a.id === id) || null;
}

/**
 * Save a new artifact
 * @param {Object} artifact - Artifact to save
 * @returns {Promise<Object>} Saved artifact
 */
async function saveArtifact(artifact) {
  const artifacts = await readArtifacts();
  artifacts.push(artifact);
  await writeJSON(PATHS.ARTIFACTS_FILE, artifacts);
  return artifact;
}

/**
 * Delete an artifact
 * @param {string} id - Artifact ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteArtifact(id) {
  const artifacts = await readArtifacts();
  const filtered = artifacts.filter(a => a.id !== id);
  
  if (filtered.length === artifacts.length) {
    return false;
  }

  await writeJSON(PATHS.ARTIFACTS_FILE, filtered);
  return true;
}

module.exports = {
  ensureDataFiles,
  readBlueprints,
  readBlueprintById,
  saveBlueprint,
  updateBlueprint,
  deleteBlueprint,
  readArtifacts,
  readArtifactById,
  saveArtifact,
  deleteArtifact,
  // Export utility functions for testing
  sanitizePath,
  readJSON,
  writeJSON,
};

// Made with Bob
