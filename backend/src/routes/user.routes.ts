import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateUserSchema, UpdateUserSchema } from '../types/index.js';

const router = Router();

// All user management routes require JWT authentication AND 'Admin' role
router.use(authenticateJWT);
router.use(requireRole('Admin'));

router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/', validateBody(CreateUserSchema), (req, res, next) => userController.createUser(req, res, next));
router.put('/:id', validateBody(UpdateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.patch('/:id/toggle-status', (req, res, next) => userController.toggleStatus(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
