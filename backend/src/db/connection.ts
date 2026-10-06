import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config/env.js';
import { seedDatabase } from './seed.js';

let mongod: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  // First, attempt connecting to the configured MongoDB URI (e.g. local mongod daemon)
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('[DB] Successfully connected to external MongoDB instance.');
  } catch (error) {
    console.warn('[DB] Local MongoDB daemon not reachable. Initializing embedded in-memory MongoDB engine...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'mploychek',
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Successfully connected to in-memory MongoDB at: ${memoryUri}`);
  }

  // Run seed check
  await seedDatabase();
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
