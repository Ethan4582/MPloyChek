"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error(`[Error] Unhandled error at ${req.method} ${req.path}:`, err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    });
}
