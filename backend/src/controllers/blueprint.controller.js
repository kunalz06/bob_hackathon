const blueprintService = require('../services/blueprint.service');
const { validateIdea } = require('../utils/validators');
const { exportToMarkdown, saveMarkdownToFile } = require('../exporters/markdownExporter');
const { asyncHandler } = require('../utils/errors');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Generate a new blueprint
 */
const generateBlueprint = asyncHandler(async (req, res) => {
  const { idea } = req.body;

  // Validate idea
  const validation = validateIdea(idea);
  if (!validation.isValid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid idea input',
        details: validation.errors
      }
    });
  }

  // Generate blueprint
  const blueprint = await blueprintService.generateBlueprint(idea);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    projectId: blueprint.id,
    blueprint
  });
});

/**
 * Get all blueprints
 */
const getAllBlueprints = asyncHandler(async (req, res) => {
  const blueprints = await blueprintService.getAllBlueprints();

  res.json({
    success: true,
    blueprints
  });
});

/**
 * Get blueprint by ID
 */
const getBlueprintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blueprint = await blueprintService.getBlueprintById(id);

  if (!blueprint) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Blueprint not found'
      }
    });
  }

  res.json({
    success: true,
    blueprint
  });
});

/**
 * Export blueprint as Markdown
 */
const exportBlueprintMarkdown = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blueprint = await blueprintService.getBlueprintById(id);

  if (!blueprint) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Blueprint not found'
      }
    });
  }

  // Generate Markdown content using the exporter
  const markdown = exportToMarkdown(blueprint);

  // Save to exports directory
  const filepath = await saveMarkdownToFile(blueprint, markdown);

  // Set headers for file download
  const slug = blueprint.slug || blueprint.projectName || blueprint.id;
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}-blueprint.md"`);
  
  // Send markdown content
  res.send(markdown);

  // Log success
  console.log(`Blueprint exported to: ${filepath}`);
});

module.exports = {
  generateBlueprint,
  getAllBlueprints,
  getBlueprintById,
  exportBlueprintMarkdown
};

// Made with Bob
