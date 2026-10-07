import dotenv from 'dotenv';
dotenv.config();

const rawMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'mploychek-production-grade-jwt-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  mongoUri: rawMongoUri.trim(),
  nodeEnv: process.env.NODE_ENV || 'development',
};
