const artifactService = require('../services/artifact.service');
const { asyncHandler } = require('../utils/errors');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Create a new artifact
 */
const createArtifact = asyncHandler(async (req, res) => {
  const artifact = await artifactService.createArtifact(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    id: artifact.id,
    artifact
  });
});

/**
 * Get all artifacts
 */
const getAllArtifacts = asyncHandler(async (req, res) => {
  const { projectName } = req.query;
  const artifacts = await artifactService.getAllArtifacts(projectName);

  res.json({
    success: true,
    artifacts
  });
});

/**
 * Get artifact by ID
 */
const getArtifactById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artifact = await artifactService.getArtifactById(id);

  res.json({
    success: true,
    artifact
  });
});

/**
 * Delete artifact by ID
 */
const deleteArtifact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await artifactService.deleteArtifact(id);

  res.json({
    success: true,
    message: 'Artifact deleted successfully'
  });
});

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById,
  deleteArtifact
};

// Made with Bob
