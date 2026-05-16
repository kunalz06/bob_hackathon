const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifact.controller');

/**
 * POST /api/artifacts
 * Create new artifact
 */
router.post('/', artifactController.createArtifact);

/**
 * GET /api/artifacts
 * Get all artifacts (with optional projectId query param)
 */
router.get('/', artifactController.getAllArtifacts);

/**
 * GET /api/artifacts/:id
 * Get artifact by ID
 */
router.get('/:id', artifactController.getArtifactById);

module.exports = router;

// Made with Bob
