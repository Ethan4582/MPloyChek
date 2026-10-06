"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const record_controller_js_1 = require("../controllers/record.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Records retrieval is authenticated for both General User and Admin,
// but the controller scopes visibility according to the user's role!
router.use(auth_middleware_js_1.authenticateJWT);
router.get('/', (req, res, next) => record_controller_js_1.recordController.getRecords(req, res, next));
exports.default = router;
