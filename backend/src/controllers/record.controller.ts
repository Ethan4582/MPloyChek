import { Request, Response, NextFunction } from 'express';
import { recordService } from '../services/record.service.js';

export class RecordController {
  async getRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const result = await recordService.getRecordsForUser(user.userId, user.role);

      res.status(200).json({
        success: true,
        data: result.records,
        meta: result.accessLevelSummary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recordController = new RecordController();
