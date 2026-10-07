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

  async createRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      // Admin can create record for any user; general user can create record for self
      const recordData = {
        ...req.body,
        userId: user.role === 'Admin' && req.body.userId ? req.body.userId : user.userId,
      };

      const record = await recordService.createRecord(recordData);
      res.status(201).json({
        success: true,
        message: 'Employment verification record created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recordController = new RecordController();
