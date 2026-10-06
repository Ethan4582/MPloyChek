import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { LoginSchema, RegisterSchema } from '../types/index.js';

const router = Router();

router.post('/register', validateBody(RegisterSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validateBody(LoginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateJWT, (req, res, next) => authController.me(req, res, next));

export default router;
