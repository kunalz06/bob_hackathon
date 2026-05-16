const crypto = require('crypto');
const storageService = require('./storage.service');
const { isValidArtifactType } = require('../utils/validators');

/**
 * Create a new artifact
 * @param {Object} data - Artifact data
 * @returns {Promise<Object>} Created artifact
 */
async function createArtifact(data) {
  const { projectId, type, content } = data;

  if (!isValidArtifactType(type)) {
    throw new Error(`Invalid artifact type: ${type}`);
  }

  const artifact = {
    artifactId: crypto.randomUUID(),
    projectId,
    type,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await storageService.saveArtifact(artifact);
  return artifact;
}

/**
 * Get all artifacts, optionally filtered by project
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function getAllArtifacts(projectId = null) {
  return await storageService.readArtifacts(projectId);
}

/**
 * Get artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object|null>} Artifact or null
 */
async function getArtifactById(id) {
  return await storageService.readArtifactById(id);
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById
};

// Made with Bob
