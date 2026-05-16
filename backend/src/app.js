const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRoutes = require('./routes/health.routes');
const blueprintRoutes = require('./routes/blueprint.routes');
const artifactRoutes = require('./routes/artifact.routes');
const { errorHandler } = require('./utils/errors');
const { HTTP_STATUS } = require('./config/constants');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/artifacts', artifactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

// Made with Bob
