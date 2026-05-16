import dotenv from 'dotenv';
import app from './app.js';
import { initializeDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`Smart Attendance API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Made with Bob
