import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { seedDatabase } from './seed.js';

async function main() {
  const uri = config.mongoUri || 'mongodb://localhost:27017/mploychek';
  console.log(`[Seed CLI] Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  await seedDatabase();
  await mongoose.disconnect();
  console.log('[Seed CLI] Seeding completed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Seed CLI] Error while seeding:', err);
  process.exit(1);
});
