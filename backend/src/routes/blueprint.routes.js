const express = require('express');
const router = express.Router();
const blueprintController = require('../controllers/blueprint.controller');

/**
 * POST /api/blueprints/generate
 * Generate new blueprint from idea
 */
router.post('/generate', blueprintController.generateBlueprint);

/**
 * GET /api/blueprints
 * Get all blueprints
 */
router.get('/', blueprintController.getAllBlueprints);

/**
 * GET /api/blueprints/:id
 * Get blueprint by ID
 */
router.get('/:id', blueprintController.getBlueprintById);

/**
 * GET /api/blueprints/:id/export/markdown
 * Export blueprint as Markdown
 */
router.get('/:id/export/markdown', blueprintController.exportBlueprintMarkdown);

module.exports = router;

// Made with Bob
