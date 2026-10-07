import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB, disconnectDB, isUsingInMemoryDB } from './db/connection.js';
import { errorHandler } from './middleware/error.middleware.js';
import { telemetryMiddleware } from './middleware/telemetry.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import recordRoutes from './routes/record.routes.js';
import telemetryRoutes from './routes/telemetry.routes.js';
import docsRoutes from './routes/docs.routes.js';

const app = express();

// Security and CORS
app.use(
  cors({
    origin: '*',
  })
);

// Logging
app.use(morgan('dev'));

// JSON parsing
app.use(express.json());

// Global Telemetry & Simulated Delay Engine (?delay=ms)
app.use(telemetryMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MPloyChek Backend Service',
    database: isUsingInMemoryDB() ? 'MongoDB (Embedded In-Memory)' : 'MongoDB (Configured URI)',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/docs', docsRoutes);

// Global Error Handler
app.use(errorHandler);

// Server startup
async function bootstrap() {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 MPloyChek Backend API running on port ${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`📊 Live Telemetry: http://localhost:${config.port}/api/telemetry`);
      console.log(`📖 System Design: http://localhost:${config.port}/api/docs/system-design`);
      console.log(`🔐 Environment: ${config.nodeEnv}`);
      console.log(`💾 Database: ${isUsingInMemoryDB() ? 'Embedded In-Memory MongoDB' : 'External MongoDB'}`);
      console.log(`⏱️ Simulated Delay Engine: Active (via ?delay=ms parameter)`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] MongoDB and HTTP server shut down.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Bootstrap] Critical startup error:', error);
    process.exit(1);
  }
}

bootstrap();
