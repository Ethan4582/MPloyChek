"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_js_1 = require("../config/env.js");
const seed_js_1 = require("./seed.js");
let mongod = null;
async function connectDB() {
    // First, attempt connecting to the configured MongoDB URI (e.g. local mongod daemon)
    try {
        console.log(`[DB] Attempting connection to MongoDB at: ${env_js_1.config.mongoUri}`);
        await mongoose_1.default.connect(env_js_1.config.mongoUri, {
            serverSelectionTimeoutMS: 2000,
        });
        console.log('[DB] Successfully connected to external MongoDB instance.');
    }
    catch (error) {
        console.warn('[DB] Local MongoDB daemon not reachable. Initializing embedded in-memory MongoDB engine...');
        mongod = await mongodb_memory_server_1.MongoMemoryServer.create({
            instance: {
                dbName: 'mploychek',
            },
        });
        const memoryUri = mongod.getUri();
        await mongoose_1.default.connect(memoryUri);
        console.log(`[DB] Successfully connected to in-memory MongoDB at: ${memoryUri}`);
    }
    // Run seed check
    await (0, seed_js_1.seedDatabase)();
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    if (mongod) {
        await mongod.stop();
    }
}
