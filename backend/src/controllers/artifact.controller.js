const artifactService = require('../services/artifact.service');

/**
 * Create a new artifact
 */
async function createArtifact(req, res) {
  try {
    const {
      projectName,
      filePath,
      artifactType,
      purpose,
      createdBy,
      bobSessionFile,
      status,
      notes
    } = req.body;

    if (!projectName || !filePath || !artifactType || !purpose) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: projectName, filePath, artifactType, purpose'
        }
      });
    }

    const artifact = await artifactService.createArtifact({
      projectName,
      filePath,
      artifactType,
      purpose,
      createdBy,
      bobSessionFile,
      status,
      notes
    });

    res.status(201).json({
      success: true,
      id: artifact.id,
      artifact
    });
  } catch (error) {
    console.error('Error creating artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATION_ERROR',
        message: 'Failed to create artifact',
        details: error.message
      }
    });
  }
}

/**
 * Get all artifacts
 */
async function getAllArtifacts(req, res) {
  try {
    const { projectName } = req.query;
    const artifacts = await artifactService.getAllArtifacts(projectName);

    res.json({
      success: true,
      artifacts
    });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch artifacts',
        details: error.message
      }
    });
  }
}

/**
 * Get artifact by ID
 */
async function getArtifactById(req, res) {
  try {
    const { id } = req.params;
    const artifact = await artifactService.getArtifactById(id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    res.json({
      success: true,
      artifact
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch artifact',
        details: error.message
      }
    });
  }
}

/**
 * Delete artifact by ID
 */
async function deleteArtifact(req, res) {
  try {
    const { id } = req.params;
    const deleted = await artifactService.deleteArtifact(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Artifact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete artifact',
        details: error.message
      }
    });
  }
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById,
  deleteArtifact
};

// Made with Bob
