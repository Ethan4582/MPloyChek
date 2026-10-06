"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// All user management routes require JWT authentication AND 'Admin' role
router.use(auth_middleware_js_1.authenticateJWT);
router.use((0, auth_middleware_js_1.requireRole)('Admin'));
router.get('/', (req, res, next) => user_controller_js_1.userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => user_controller_js_1.userController.getUserById(req, res, next));
router.post('/', (0, validate_middleware_js_1.validateBody)(index_js_1.CreateUserSchema), (req, res, next) => user_controller_js_1.userController.createUser(req, res, next));
router.put('/:id', (0, validate_middleware_js_1.validateBody)(index_js_1.UpdateUserSchema), (req, res, next) => user_controller_js_1.userController.updateUser(req, res, next));
router.patch('/:id/toggle-status', (req, res, next) => user_controller_js_1.userController.toggleStatus(req, res, next));
router.delete('/:id', (req, res, next) => user_controller_js_1.userController.deleteUser(req, res, next));
exports.default = router;
