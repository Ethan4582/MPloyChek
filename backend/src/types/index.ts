import { z } from 'zod';

export type UserRole = 'General User' | 'Admin';
export type UserStatus = 'Active' | 'Disabled';

export interface IUser {
  _id: string;
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  passwordHash?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RecordAccessLevel = 'General' | 'Confidential' | 'Executive';
export type VerificationStatus = 'Verified' | 'Pending Review' | 'Flagged';

export interface IEmployeeRecord {
  _id: string;
  recordId: string;
  userId: string;
  employeeName: string;
  department: string;
  position: string;
  accessLevel: RecordAccessLevel;
  verificationStatus: VerificationStatus;
  backgroundCheckDate: string;
  // Confidential / Admin-only fields:
  compensationGrade?: string;
  riskScore?: number;
  auditNotes?: string;
  govIdMasked?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request validation schemas with Zod
export const LoginSchema = z.object({
  userId: z.string().min(3, 'User ID must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['General User', 'Admin']),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
  userId: z.string().min(3).max(50),
  name: z.string().min(2).max(100),
  role: z.enum(['General User', 'Admin']),
  department: z.string().min(2).max(50),
  password: z.string().min(6),
  status: z.enum(['Active', 'Disabled']).default('Active'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['General User', 'Admin']).optional(),
  department: z.string().min(2).max(50).optional(),
  status: z.enum(['Active', 'Disabled']).optional(),
  password: z.string().min(6).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  name: string;
  department: string;
}
