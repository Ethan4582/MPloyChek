import { UserRole } from './auth.models';

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
  // Confidential / Admin-only fields (filtered out for General Users):
  compensationGrade?: string;
  riskScore?: number;
  auditNotes?: string;
  govIdMasked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordAccessSummary {
  userRole: UserRole;
  totalRecords: number;
  confidentialFieldsVisible: boolean;
  scope: 'ALL_ORGANIZATIONAL' | 'USER_ASSIGNED_ONLY';
}

export interface RecordsResponse {
  success: boolean;
  data: IEmployeeRecord[];
  meta: RecordAccessSummary;
}
