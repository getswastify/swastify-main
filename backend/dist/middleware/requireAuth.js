"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.auth_token;
    if (!token) {
        res.status(401).json({ status: false, message: 'Auth token missing' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'object' && decoded !== null) {
            req.user = decoded;
        }
        else {
            res.status(401).json({ status: false, message: 'Invalid token payload' });
        }
        next();
    }
    catch (error) {
        res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
};
exports.requireAuth = requireAuth;
