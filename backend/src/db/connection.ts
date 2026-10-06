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
      console.log(`[DB] Connecting to configured MongoDB: ${config.mongoUri}`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] Successfully connected to external MongoDB instance.');
      isInMemoryMode = false;
      await seedDatabase();
      return;
    } catch (error: any) {
      console.warn(`[DB] Warning: Could not connect to external MongoDB (${error.message}).`);
      console.log('[DB] Falling back to embedded in-memory MongoDB engine...');
    }
  } else {
    console.log('[DB] No MONGO_URI specified. Starting embedded in-memory MongoDB engine...');
  }

  // Zero-configuration fallback: embedded MongoDB Memory Server
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
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
