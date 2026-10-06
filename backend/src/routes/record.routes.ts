import { Router } from 'express';
import { recordController } from '../controllers/record.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Records retrieval is authenticated for both General User and Admin,
// but the controller scopes visibility according to the user's role!
router.use(authenticateJWT);

router.get('/', (req, res, next) => recordController.getRecords(req, res, next));

export default router;
