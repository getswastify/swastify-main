"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRoute = void 0;
const express_1 = require("express");
const settings_controller_1 = require("../controller/settings.controller");
const requireAuthAndRole_1 = require("../middleware/requireAuthAndRole");
const router = (0, express_1.Router)();
router.get('/doctor-settings', (0, requireAuthAndRole_1.requireAuthAndRole)('DOCTOR'), settings_controller_1.getDoctorSettings);
exports.settingsRoute = router;
