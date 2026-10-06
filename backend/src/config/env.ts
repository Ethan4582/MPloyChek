import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'mploychek-production-grade-jwt-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mploychek',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultDelayMs: parseInt(process.env.DEFAULT_DELAY_MS || '0', 10),
};
