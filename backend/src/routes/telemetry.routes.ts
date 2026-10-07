import { Router } from 'express';
import { telemetryStore } from '../middleware/telemetry.middleware.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: telemetryStore.getMetrics(),
  });
});

router.post('/reset', (req, res) => {
  telemetryStore.reset();
  res.json({
    success: true,
    message: 'Telemetry metrics buffer reset successfully',
  });
});

export default router;
