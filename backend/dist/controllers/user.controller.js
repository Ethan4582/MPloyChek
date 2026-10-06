"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_js_1 = require("../services/user.service.js");
class UserController {
    async getAllUsers(req, res, next) {
        try {
            const users = await user_service_js_1.userService.getAllUsers();
            res.status(200).json({
                success: true,
                count: users.length,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const user = await user_service_js_1.userService.getUserById(req.params.id);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const newUser = await user_service_js_1.userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: 'User created successfully in database',
                data: newUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const updatedUser = await user_service_js_1.userService.updateUser(req.params.id, req.body);
            if (!updatedUser) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const user = await user_service_js_1.userService.toggleStatus(req.params.id);
            res.status(200).json({
                success: true,
                message: `User status changed to ${user.status}`,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const currentAdminUserId = req.user.userId;
            await user_service_js_1.userService.deleteUser(req.params.id, currentAdminUserId);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
