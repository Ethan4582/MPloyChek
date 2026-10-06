"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const user_repository_js_1 = require("../repositories/user.repository.js");
class AuthService {
    async login(input) {
        const user = await user_repository_js_1.userRepository.findByUserId(input.userId);
        if (!user) {
            throw { status: 401, message: 'Invalid credentials. User ID not found.' };
        }
        if (user.status === 'Disabled') {
            throw { status: 403, message: 'Account is currently suspended. Please contact an Administrator.' };
        }
        // Role check: verifies the user holds the role requested during login
        if (user.role !== input.role) {
            throw {
                status: 403,
                message: `Role mismatch: User '${input.userId}' is registered as '${user.role}', but login was attempted with role '${input.role}'.`,
            };
        }
        if (!user.passwordHash) {
            throw { status: 401, message: 'Invalid credentials. Password not configured.' };
        }
        const isMatch = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid credentials. Incorrect password.' };
        }
        // Update last login
        await user_repository_js_1.userRepository.updateLastLogin(user.userId);
        const payload = {
            userId: user.userId,
            role: user.role,
            name: user.name,
            department: user.department,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_js_1.config.jwtSecret, {
            expiresIn: env_js_1.config.jwtExpiresIn,
        });
        return {
            token,
            expiresIn: env_js_1.config.jwtExpiresIn,
            user: {
                _id: user._id.toString(),
                userId: user.userId,
                name: user.name,
                role: user.role,
                department: user.department,
                status: user.status,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
    async getCurrentUser(userId) {
        const user = await user_repository_js_1.userRepository.findByUserId(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        return {
            _id: user._id.toString(),
            userId: user.userId,
            name: user.name,
            role: user.role,
            department: user.department,
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
