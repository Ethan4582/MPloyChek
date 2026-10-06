import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './db/connection.js';
import { delayMiddleware } from './middleware/delay.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import recordRoutes from './routes/record.routes.js';

const app = express();

// Security and CORS
app.use(
  cors({
    origin: '*',
    exposedHeaders: ['X-Simulated-Delay', 'X-Response-Duration'],
  })
);

// Logging
app.use(morgan('dev'));

// JSON parsing
app.use(express.json());

// Latency Emulation Middleware (applies to all /api routes)
app.use('/api', delayMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MPloyChek Backend Service',
    database: 'MongoDB (Mongoose ODM)',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);

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
      console.log(`🔐 Environment: ${config.nodeEnv}`);
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
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();
