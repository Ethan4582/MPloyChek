import bcrypt from 'bcryptjs';
import { UserModel } from './schemas/user.schema.js';
import { RecordModel } from './schemas/record.schema.js';

export async function seedDatabase(): Promise<void> {
  const userCount = await UserModel.countDocuments();
  if (userCount > 0) {
    console.log(`[Seed] Database already populated with ${userCount} users. Skipping seeding.`);
    return;
  }

  console.log('[Seed] Seeding database with initial users and employment verification records...');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  const users = [
    {
      userId: 'admin@mploychek.com',
      name: 'Alexander Vance',
      role: 'Admin',
      department: 'Security & Compliance',
      status: 'Active',
      passwordHash: defaultPasswordHash,
      lastLoginAt: new Date(),
    },
    {
      userId: 'user@mploychek.com',
      name: 'Jordan Rivera',
      role: 'General User',
      department: 'Software Engineering',
      status: 'Active',
      passwordHash: defaultPasswordHash,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 24),
    },
    {
      userId: 'sarah.chen@mploychek.com',
      name: 'Sarah Chen',
      role: 'General User',
      department: 'Product Design',
      status: 'Active',
      passwordHash: defaultPasswordHash,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 48),
    },
    {
      userId: 'david.miller@mploychek.com',
      name: 'David Miller',
      role: 'General User',
      department: 'Finance & Payroll',
      status: 'Active',
      passwordHash: defaultPasswordHash,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 12),
    },
    {
      userId: 'elena.rostova@mploychek.com',
      name: 'Elena Rostova',
      role: 'Admin',
      department: 'People Operations',
      status: 'Active',
      passwordHash: defaultPasswordHash,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 6),
    },
  ];

  await UserModel.insertMany(users);
  console.log(`[Seed] Created ${users.length} users successfully.`);

  const records = [
    {
      recordId: 'REC-2026-001',
      userId: 'user@mploychek.com',
      employeeName: 'Jordan Rivera',
      department: 'Software Engineering',
      position: 'Senior Full Stack Engineer',
      accessLevel: 'General',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-01-15',
      compensationGrade: 'L6-Principal',
      riskScore: 4,
      auditNotes: 'Clean background check. Criminal and credit verified clear.',
      govIdMasked: 'XXX-XX-4819',
    },
    {
      recordId: 'REC-2026-002',
      userId: 'user@mploychek.com',
      employeeName: 'Jordan Rivera',
      department: 'Software Engineering',
      position: 'Senior Full Stack Engineer',
      accessLevel: 'General',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2025-06-10',
      compensationGrade: 'L6-Principal',
      riskScore: 2,
      auditNotes: 'Security clearance renewed for Cloud Infrastructure tier 2.',
      govIdMasked: 'XXX-XX-4819',
    },
    {
      recordId: 'REC-2026-003',
      userId: 'user@mploychek.com',
      employeeName: 'Jordan Rivera',
      department: 'Software Engineering',
      position: 'Senior Full Stack Engineer',
      accessLevel: 'Confidential',
      verificationStatus: 'Pending Review',
      backgroundCheckDate: '2026-09-20',
      compensationGrade: 'L6-Principal',
      riskScore: 12,
      auditNotes: 'Annual financial conflict of interest declaration undergoing legal sign-off.',
      govIdMasked: 'XXX-XX-4819',
    },
    {
      recordId: 'REC-2026-004',
      userId: 'admin@mploychek.com',
      employeeName: 'Alexander Vance',
      department: 'Security & Compliance',
      position: 'VP of Information Security',
      accessLevel: 'Executive',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-02-01',
      compensationGrade: 'E2-Executive',
      riskScore: 1,
      auditNotes: 'Top secret corporate security authorization verified. Bi-annual polygraph complete.',
      govIdMasked: 'XXX-XX-9102',
    },
    {
      recordId: 'REC-2026-005',
      userId: 'sarah.chen@mploychek.com',
      employeeName: 'Sarah Chen',
      department: 'Product Design',
      position: 'Staff UX Architect',
      accessLevel: 'General',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-03-14',
      compensationGrade: 'L5-Senior',
      riskScore: 3,
      auditNotes: 'Identity, degree accreditation, and references fully verified.',
      govIdMasked: 'XXX-XX-3341',
    },
    {
      recordId: 'REC-2026-006',
      userId: 'david.miller@mploychek.com',
      employeeName: 'David Miller',
      department: 'Finance & Payroll',
      position: 'Financial Controller',
      accessLevel: 'Confidential',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-04-18',
      compensationGrade: 'L7-Director',
      riskScore: 5,
      auditNotes: 'CPA license active and in good standing with state board.',
      govIdMasked: 'XXX-XX-7811',
    },
    {
      recordId: 'REC-2026-007',
      userId: 'elena.rostova@mploychek.com',
      employeeName: 'Elena Rostova',
      department: 'People Operations',
      position: 'Director of Talent Acquisition',
      accessLevel: 'Executive',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-05-22',
      compensationGrade: 'E1-Director',
      riskScore: 2,
      auditNotes: 'Full background and executive vetting completed.',
      govIdMasked: 'XXX-XX-6029',
    },
    {
      recordId: 'REC-2026-008',
      userId: 'marcus.brooks@mploychek.com',
      employeeName: 'Marcus Brooks',
      department: 'Legal Operations',
      position: 'General Counsel Associate',
      accessLevel: 'Confidential',
      verificationStatus: 'Flagged',
      backgroundCheckDate: '2026-08-30',
      compensationGrade: 'L6-Counsel',
      riskScore: 48,
      auditNotes: 'Discrepancy in previous employment tenure dates. Pending clarification from prior employer HR.',
      govIdMasked: 'XXX-XX-1192',
    },
    {
      recordId: 'REC-2026-009',
      userId: 'ananya.sharma@mploychek.com',
      employeeName: 'Ananya Sharma',
      department: 'Data Science & AI',
      position: 'Principal ML Research Scientist',
      accessLevel: 'General',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-07-11',
      compensationGrade: 'L7-Principal',
      riskScore: 2,
      auditNotes: 'Ph.D. credential verified with Stanford University registrar.',
      govIdMasked: 'XXX-XX-8490',
    },
    {
      recordId: 'REC-2026-010',
      userId: 'tariq.mansour@mploychek.com',
      employeeName: 'Tariq Mansour',
      department: 'Cloud DevOps',
      position: 'Lead Site Reliability Engineer',
      accessLevel: 'General',
      verificationStatus: 'Verified',
      backgroundCheckDate: '2026-06-05',
      compensationGrade: 'L5-Lead',
      riskScore: 6,
      auditNotes: 'AWS and Kubernetes certifications verified with issuing authorities.',
      govIdMasked: 'XXX-XX-5520',
    },
  ];

  await RecordModel.insertMany(records);
  console.log(`[Seed] Created ${records.length} employee verification records successfully.`);
}
