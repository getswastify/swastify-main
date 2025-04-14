"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pingRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json({
        status: "success",
        message: "pong"
    });
});
exports.pingRoutes = router;
