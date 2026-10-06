import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../../types/index.js';

export interface UserDocument extends Document, Omit<IUser, '_id'> {}

const UserSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['General User', 'Admin'], index: true },
    department: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Disabled'], default: 'Active', index: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
UserSchema.index({ role: 1, status: 1 });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
