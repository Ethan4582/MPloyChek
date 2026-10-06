import { RecordModel, RecordDocument } from '../db/schemas/record.schema.js';
import { UserRole } from '../types/index.js';

export interface IRecordRepository {
  findForUser(userId: string, role: UserRole): Promise<RecordDocument[]>;
  findById(id: string): Promise<RecordDocument | null>;
  create(data: Partial<RecordDocument>): Promise<RecordDocument>;
  delete(id: string): Promise<boolean>;
}

export class MongoRecordRepository implements IRecordRepository {
  async findForUser(userId: string, role: UserRole): Promise<RecordDocument[]> {
    if (role === 'Admin') {
      // Admins see all organizational records
      return RecordModel.find().sort({ createdAt: -1 }).exec();
    }

    // General Users only see records matching their userId, and only General or assigned records
    return RecordModel.find({ userId: userId.toLowerCase().trim() })
      .select('-riskScore -auditNotes -compensationGrade') // Exclude sensitive columns at the query level
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<RecordDocument | null> {
    return RecordModel.findById(id).exec();
  }

  async create(data: Partial<RecordDocument>): Promise<RecordDocument> {
    const record = new RecordModel(data);
    return record.save();
  }

  async delete(id: string): Promise<boolean> {
    const result = await RecordModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

export const recordRepository: IRecordRepository = new MongoRecordRepository();
