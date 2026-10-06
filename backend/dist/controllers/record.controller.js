"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordController = exports.RecordController = void 0;
const record_service_js_1 = require("../services/record.service.js");
class RecordController {
    async getRecords(req, res, next) {
        try {
            const user = req.user;
            const result = await record_service_js_1.recordService.getRecordsForUser(user.userId, user.role);
            res.status(200).json({
                success: true,
                data: result.records,
                meta: result.accessLevelSummary,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RecordController = RecordController;
exports.recordController = new RecordController();
