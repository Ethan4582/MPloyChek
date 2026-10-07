import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config/env.js';
import { seedDatabase } from './seed.js';

let mongod: MongoMemoryServer | null = null;
let isInMemoryMode = false;

export function isUsingInMemoryDB(): boolean {
  return isInMemoryMode;
}

export async function connectDB(): Promise<void> {
  // If MONGO_URI is set, connect directly to the user's MongoDB instance
  if (config.mongoUri) {
    try {
      console.log(`[DB] Connecting to configured MongoDB...`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] Successfully connected to external MongoDB instance.');
      isInMemoryMode = false;
      await seedDatabase();
      return;
    } catch (error: any) {
      console.error(`[DB] Failed to connect to external MongoDB: ${error.message}`);
      if (config.nodeEnv === 'production') {
        throw new Error(
          `Could not connect to configured MongoDB (${error.message}). ` +
          `Please check that: ` +
          `1. Your MongoDB Atlas Network Access whitelist allows connection (0.0.0.0/0). ` +
          `2. Your username and password in MONGO_URI are correct (special characters must be URL-encoded). ` +
          `3. Your database cluster is online and reachable.`
        );
      }
      console.log('[DB] Development mode: falling back to embedded in-memory MongoDB engine...');
    }
  } else {
    if (config.nodeEnv === 'production') {
      throw new Error(
        'MONGO_URI (or MONGODB_URI) environment variable is required in production mode. ' +
        'Please add your MongoDB connection string to your deployment environment variables.'
      );
    }
    console.log('[DB] No MONGO_URI specified. Starting embedded in-memory MongoDB engine...');
  }

  // Zero-configuration fallback for local development: embedded MongoDB Memory Server
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'mploychek',
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    isInMemoryMode = true;
    console.log(`[DB] Successfully connected to embedded in-memory MongoDB at: ${memoryUri}`);

    // Seed default dataset so everything is testable immediately
    await seedDatabase();
  } catch (err: any) {
    throw new Error(
      `Failed to initialize embedded in-memory MongoDB (${err.message}). ` +
      `Alpine Linux or minimal container images do not support mongodb-memory-server binaries. ` +
      `Please provide the MONGO_URI environment variable pointing to your MongoDB Atlas cluster.`
    );
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
