const blueprintService = require('../services/blueprint.service');
const { validateIdea } = require('../utils/validators');
const { exportToMarkdown, saveMarkdownToFile } = require('../exporters/markdownExporter');

/**
 * Generate a new blueprint
 */
async function generateBlueprint(req, res) {
  try {
    const { idea } = req.body;

    // Validate idea
    const validation = validateIdea(idea);
    if (!validation.isValid) {
      return res.status(400).json({
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

    res.status(201).json({
      success: true,
      projectId: blueprint.id,
      blueprint
    });
  } catch (error) {
    console.error('Error generating blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to generate blueprint',
        details: error.message
      }
    });
  }
}

/**
 * Get all blueprints
 */
async function getAllBlueprints(req, res) {
  try {
    const blueprints = await blueprintService.getAllBlueprints();

    res.json({
      success: true,
      blueprints
    });
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blueprints',
        details: error.message
      }
    });
  }
}

/**
 * Get blueprint by ID
 */
async function getBlueprintById(req, res) {
  try {
    const { id } = req.params;
    const blueprint = await blueprintService.getBlueprintById(id);

    if (!blueprint) {
      return res.status(404).json({
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
  } catch (error) {
    console.error('Error fetching blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blueprint',
        details: error.message
      }
    });
  }
}

/**
 * Export blueprint as Markdown
 */
async function exportBlueprintMarkdown(req, res) {
  try {
    const { id } = req.params;
    const blueprint = await blueprintService.getBlueprintById(id);

    if (!blueprint) {
      return res.status(404).json({
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
    const filepath = saveMarkdownToFile(blueprint, markdown);

    // Set headers for file download
    const slug = blueprint.idea?.processed?.slug || blueprint.slug || blueprint.projectId;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-blueprint.md"`);
    
    // Send markdown content
    res.send(markdown);

    // Log success
    console.log(`Blueprint exported to: ${filepath}`);
  } catch (error) {
    console.error('Error exporting blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export blueprint',
        details: error.message
      }
    });
  }
}

module.exports = {
  generateBlueprint,
  getAllBlueprints,
  getBlueprintById,
  exportBlueprintMarkdown
};

// Made with Bob
