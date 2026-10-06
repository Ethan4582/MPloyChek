import mongoose, { Schema, Document } from 'mongoose';
import { IEmployeeRecord, RecordAccessLevel, VerificationStatus } from '../../types/index.js';

export interface RecordDocument extends Document, Omit<IEmployeeRecord, '_id'> {}

const RecordSchema = new Schema<RecordDocument>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true, index: true },
    position: { type: String, required: true },
    accessLevel: {
      type: String,
      required: true,
      enum: ['General', 'Confidential', 'Executive'],
      default: 'General',
      index: true,
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ['Verified', 'Pending Review', 'Flagged'],
      default: 'Verified',
      index: true,
    },
    backgroundCheckDate: { type: String, required: true },
    compensationGrade: { type: String },
    riskScore: { type: Number },
    auditNotes: { type: String },
    govIdMasked: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for role-based scoping and filtering
RecordSchema.index({ userId: 1, accessLevel: 1 });
RecordSchema.index({ department: 1, verificationStatus: 1 });

export const RecordModel = mongoose.model<RecordDocument>('EmployeeRecord', RecordSchema);
