const crypto = require('crypto');
const storageService = require('./storage.service');
const { isValidArtifactType } = require('../utils/validators');

/**
 * Create a new artifact
 * @param {Object} data - Artifact data
 * @returns {Promise<Object>} Created artifact
 */
async function createArtifact(data) {
  const {
    projectName,
    filePath,
    artifactType,
    purpose,
    createdBy = 'IBM Bob',
    bobSessionFile,
    status = 'completed',
    notes
  } = data;

  if (!projectName || !filePath || !artifactType || !purpose) {
    throw new Error('Missing required fields: projectName, filePath, artifactType, purpose');
  }

  if (!isValidArtifactType(artifactType)) {
    throw new Error(`Invalid artifact type: ${artifactType}`);
  }

  const artifact = {
    id: crypto.randomUUID(),
    projectName,
    filePath,
    artifactType,
    purpose,
    createdBy,
    bobSessionFile: bobSessionFile || null,
    status,
    notes: notes || null,
    createdAt: new Date().toISOString()
  };

  await storageService.saveArtifact(artifact);
  return artifact;
}

/**
 * Get all artifacts, optionally filtered by project
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function getAllArtifacts(projectName = null) {
  const artifacts = await storageService.readArtifacts();
  
  if (projectName) {
    return artifacts.filter(a => a.projectName === projectName);
  }
  
  return artifacts;
}

/**
 * Get artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object|null>} Artifact or null
 */
async function getArtifactById(id) {
  const artifacts = await storageService.readArtifacts();
  return artifacts.find(a => a.id === id) || null;
}

/**
 * Delete artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteArtifact(id) {
  return await storageService.deleteArtifact(id);
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById,
  deleteArtifact
};

// Made with Bob
