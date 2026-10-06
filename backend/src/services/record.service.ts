import { recordRepository } from '../repositories/record.repository.js';
import { IEmployeeRecord, UserRole } from '../types/index.js';

export class RecordService {
  async getRecordsForUser(
    userId: string,
    role: UserRole
  ): Promise<{
    records: Partial<IEmployeeRecord>[];
    accessLevelSummary: {
      userRole: UserRole;
      totalRecords: number;
      confidentialFieldsVisible: boolean;
      scope: 'ALL_ORGANIZATIONAL' | 'USER_ASSIGNED_ONLY';
    };
  }> {
    const rawRecords = await recordRepository.findForUser(userId, role);

    const records = rawRecords.map((doc) => {
      const rec = doc.toObject();
      if (role === 'General User') {
        // Strip out confidential fields securely
        delete rec.riskScore;
        delete rec.auditNotes;
        delete rec.compensationGrade;
      }
      return rec;
    });

    return {
      records,
      accessLevelSummary: {
        userRole: role,
        totalRecords: records.length,
        confidentialFieldsVisible: role === 'Admin',
        scope: role === 'Admin' ? 'ALL_ORGANIZATIONAL' : 'USER_ASSIGNED_ONLY',
      },
    };
  }
}

export const recordService = new RecordService();
