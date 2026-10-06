"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordRepository = exports.MongoRecordRepository = void 0;
const record_schema_js_1 = require("../db/schemas/record.schema.js");
class MongoRecordRepository {
    async findForUser(userId, role) {
        if (role === 'Admin') {
            // Admins see all organizational records
            return record_schema_js_1.RecordModel.find().sort({ createdAt: -1 }).exec();
        }
        // General Users only see records matching their userId, and only General or assigned records
        return record_schema_js_1.RecordModel.find({ userId: userId.toLowerCase().trim() })
            .select('-riskScore -auditNotes -compensationGrade') // Exclude sensitive columns at the query level
            .sort({ createdAt: -1 })
            .exec();
    }
    async findById(id) {
        return record_schema_js_1.RecordModel.findById(id).exec();
    }
    async create(data) {
        const record = new record_schema_js_1.RecordModel(data);
        return record.save();
    }
    async delete(id) {
        const result = await record_schema_js_1.RecordModel.findByIdAndDelete(id).exec();
        return !!result;
    }
}
exports.MongoRecordRepository = MongoRecordRepository;
exports.recordRepository = new MongoRecordRepository();
