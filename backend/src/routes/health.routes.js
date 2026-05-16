const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BobForge Backend',
    version: '1.0.0'
  });
});

module.exports = router;

// Made with Bob
