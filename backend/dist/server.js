"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const connection_js_1 = require("./db/connection.js");
const delay_middleware_js_1 = require("./middleware/delay.middleware.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const record_routes_js_1 = __importDefault(require("./routes/record.routes.js"));
const app = (0, express_1.default)();
// Security and CORS
app.use((0, cors_1.default)({
    origin: '*',
    exposedHeaders: ['X-Simulated-Delay', 'X-Response-Duration'],
}));
// Logging
app.use((0, morgan_1.default)('dev'));
// JSON parsing
app.use(express_1.default.json());
// Latency Emulation Middleware (applies to all /api routes)
app.use('/api', delay_middleware_js_1.delayMiddleware);
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
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/users', user_routes_js_1.default);
app.use('/api/records', record_routes_js_1.default);
// Global Error Handler
app.use(error_middleware_js_1.errorHandler);
// Server startup
async function bootstrap() {
    try {
        await (0, connection_js_1.connectDB)();
        const server = app.listen(env_js_1.config.port, () => {
            console.log(`====================================================`);
            console.log(`🚀 MPloyChek Backend API running on port ${env_js_1.config.port}`);
            console.log(`📡 Health Check: http://localhost:${env_js_1.config.port}/api/health`);
            console.log(`🔐 Environment: ${env_js_1.config.nodeEnv}`);
            console.log(`⏱️ Simulated Delay Engine: Active (via ?delay=ms parameter)`);
            console.log(`====================================================`);
        });
        const shutdown = async () => {
            console.log('\n[Server] Gracefully shutting down...');
            server.close(async () => {
                await (0, connection_js_1.disconnectDB)();
                console.log('[Server] MongoDB and HTTP server shut down.');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        console.error('Fatal initialization error:', error);
        process.exit(1);
    }
}
bootstrap();
