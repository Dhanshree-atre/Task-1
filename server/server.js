import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db/database.js';
import habitRoutes from './routes/habitRoutes.js';
import { setupDatabase } from './db/setup.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure database tables exist on server startup
try {
  const checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='habits'").get();
  if (!checkTable) {
    console.log('📌 Habits table missing. Running setupDatabase()...');
    setupDatabase();
  }
} catch (err) {
  console.error('⚠️ Database check failed, initializing...', err.message);
  setupDatabase();
}

// Middleware
app.use(cors({
  origin: '*', // Allow frontend Vite dev server or production preview
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/habits', habitRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Habit Tracker API running on http://localhost:${PORT}`);
  console.log(`📡 Ready for requests`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down...');
  server.close(() => {
    db.close();
    console.log('🔒 Database connection closed. Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

export default app;
