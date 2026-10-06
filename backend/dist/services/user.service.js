"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_repository_js_1 = require("../repositories/user.repository.js");
class UserService {
    async getAllUsers() {
        const users = await user_repository_js_1.userRepository.findAll();
        return users.map((u) => ({
            _id: u._id.toString(),
            userId: u.userId,
            name: u.name,
            role: u.role,
            department: u.department,
            status: u.status,
            lastLoginAt: u.lastLoginAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));
    }
    async getUserById(id) {
        const user = await user_repository_js_1.userRepository.findById(id);
        if (!user)
            return null;
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
    async createUser(input) {
        const existing = await user_repository_js_1.userRepository.findByUserId(input.userId);
        if (existing) {
            throw { status: 409, message: `User with ID '${input.userId}' already exists.` };
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
        const newUser = await user_repository_js_1.userRepository.create({
            ...input,
            passwordHash,
        });
        return {
            _id: newUser._id.toString(),
            userId: newUser.userId,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            status: newUser.status,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };
    }
    async updateUser(id, input) {
        const updatePayload = { ...input };
        if (input.password) {
            updatePayload.passwordHash = await bcryptjs_1.default.hash(input.password, 10);
            delete updatePayload.password;
        }
        const updated = await user_repository_js_1.userRepository.update(id, updatePayload);
        if (!updated)
            return null;
        return {
            _id: updated._id.toString(),
            userId: updated.userId,
            name: updated.name,
            role: updated.role,
            department: updated.department,
            status: updated.status,
            lastLoginAt: updated.lastLoginAt,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }
    async deleteUser(id, currentAdminUserId) {
        const targetUser = await user_repository_js_1.userRepository.findById(id);
        if (!targetUser) {
            throw { status: 404, message: 'User not found' };
        }
        if (targetUser.userId === currentAdminUserId) {
            throw { status: 400, message: 'Admin cannot delete their own active account.' };
        }
        return user_repository_js_1.userRepository.delete(id);
    }
    async toggleStatus(id) {
        const user = await user_repository_js_1.userRepository.findById(id);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
        const updated = await user_repository_js_1.userRepository.update(id, { status: newStatus });
        if (!updated) {
            throw { status: 500, message: 'Failed to update user status' };
        }
        return {
            _id: updated._id.toString(),
            userId: updated.userId,
            name: updated.name,
            role: updated.role,
            department: updated.department,
            status: updated.status,
            lastLoginAt: updated.lastLoginAt,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
