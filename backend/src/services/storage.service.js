const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const BLUEPRINTS_FILE = path.join(DATA_DIR, 'blueprints.json');
const ARTIFACTS_FILE = path.join(DATA_DIR, 'artifacts.json');

/**
 * Ensure data directory and files exist
 */
async function ensureDataFiles() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Create blueprints.json if it doesn't exist
    try {
      await fs.access(BLUEPRINTS_FILE);
    } catch {
      await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify([], null, 2));
    }

    // Create artifacts.json if it doesn't exist
    try {
      await fs.access(ARTIFACTS_FILE);
    } catch {
      await fs.writeFile(ARTIFACTS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
    throw error;
  }
}

/**
 * Read all blueprints
 * @returns {Promise<Array>} Array of blueprints
 */
async function readBlueprints() {
  await ensureDataFiles();
  const data = await fs.readFile(BLUEPRINTS_FILE, 'utf-8');
  return JSON.parse(data);
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
  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(blueprints, null, 2));
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
  const index = blueprints.findIndex(bp => bp.projectId === id);
  
  if (index === -1) {
    return null;
  }

  blueprints[index] = {
    ...blueprints[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(blueprints, null, 2));
  return blueprints[index];
}

/**
 * Delete a blueprint
 * @param {string} id - Blueprint ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteBlueprint(id) {
  const blueprints = await readBlueprints();
  const filtered = blueprints.filter(bp => bp.projectId !== id);
  
  if (filtered.length === blueprints.length) {
    return false;
  }

  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

/**
 * Read all artifacts
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function readArtifacts(projectId = null) {
  await ensureDataFiles();
  const data = await fs.readFile(ARTIFACTS_FILE, 'utf-8');
  const artifacts = JSON.parse(data);
  
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
  await fs.writeFile(ARTIFACTS_FILE, JSON.stringify(artifacts, null, 2));
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

  await fs.writeFile(ARTIFACTS_FILE, JSON.stringify(filtered, null, 2));
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
  deleteArtifact
};

// Made with Bob
