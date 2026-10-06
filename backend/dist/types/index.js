"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// Request validation schemas with Zod
exports.LoginSchema = zod_1.z.object({
    userId: zod_1.z.string().min(3, 'User ID must be at least 3 characters'),
    password: zod_1.z.string().min(4, 'Password must be at least 4 characters'),
    role: zod_1.z.enum(['General User', 'Admin']),
});
exports.CreateUserSchema = zod_1.z.object({
    userId: zod_1.z.string().min(3).max(50),
    name: zod_1.z.string().min(2).max(100),
    role: zod_1.z.enum(['General User', 'Admin']),
    department: zod_1.z.string().min(2).max(50),
    password: zod_1.z.string().min(6),
    status: zod_1.z.enum(['Active', 'Disabled']).default('Active'),
});
exports.UpdateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    role: zod_1.z.enum(['General User', 'Admin']).optional(),
    department: zod_1.z.string().min(2).max(50).optional(),
    status: zod_1.z.enum(['Active', 'Disabled']).optional(),
    password: zod_1.z.string().min(6).optional(),
});
