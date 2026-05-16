const crypto = require('crypto');
const storageService = require('./storage.service');
const { validateArtifact } = require('../utils/validators');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Create a new artifact
 * @param {Object} artifactData - Artifact data
 * @returns {Promise<Object>} Created artifact
 * @throws {ValidationError} If validation fails
 */
async function createArtifact(artifactData) {
  // Validate artifact data
  const validation = validateArtifact(artifactData);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors.join(', '));
  }

  const artifact = {
    id: crypto.randomUUID(),
    ...artifactData,
    createdAt: new Date().toISOString(),
    status: artifactData.status || 'active'
  };

  await storageService.saveArtifact(artifact);
  return artifact;
}

/**
 * Get all artifacts, optionally filtered by project name
 * @param {string} projectName - Optional project name filter
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
 * @returns {Promise<Object>} Artifact object
 * @throws {NotFoundError} If artifact not found
 */
async function getArtifactById(id) {
  const artifact = await storageService.readArtifactById(id);
  
  if (!artifact) {
    throw new NotFoundError('Artifact');
  }
  
  return artifact;
}

/**
 * Delete artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<boolean>} True if deleted
 * @throws {NotFoundError} If artifact not found
 */
async function deleteArtifact(id) {
  const deleted = await storageService.deleteArtifact(id);
  
  if (!deleted) {
    throw new NotFoundError('Artifact');
  }
  
  return true;
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById,
  deleteArtifact
};

// Made with Bob
