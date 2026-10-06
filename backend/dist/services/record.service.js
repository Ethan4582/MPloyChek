"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordService = exports.RecordService = void 0;
const record_repository_js_1 = require("../repositories/record.repository.js");
class RecordService {
    async getRecordsForUser(userId, role) {
        const rawRecords = await record_repository_js_1.recordRepository.findForUser(userId, role);
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
exports.RecordService = RecordService;
exports.recordService = new RecordService();
