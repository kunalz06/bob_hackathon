require('dotenv').config();
const app = require('./app');
const { ensureDataFiles } = require('./services/storage.service');

const PORT = process.env.PORT || 3001;

/**
 * Initialize data files before starting server
 */
async function startServer() {
  try {
    // Ensure data files exist
    await ensureDataFiles();
    console.log('✓ Data files initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║     BobForge Backend Server Started    ║
╠════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(33)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
║  Time: ${new Date().toISOString().padEnd(24)}║
╚════════════════════════════════════════╝

API Endpoints:
  GET    /api/health
  POST   /api/blueprints/generate
  GET    /api/blueprints
  GET    /api/blueprints/:id
  GET    /api/blueprints/:id/export/markdown
  POST   /api/artifacts
  GET    /api/artifacts
  GET    /api/artifacts/:id

Ready to generate blueprints! 🚀
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Made with Bob
