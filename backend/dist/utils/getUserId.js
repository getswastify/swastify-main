"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserId = (authToken) => {
    if (!authToken) {
        throw new Error('Auth token is required');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(authToken, process.env.JWT_SECRET || 'default_secret');
        if (typeof decoded === 'object' && 'userId' in decoded) {
            return decoded.userId;
        }
        throw new Error('Invalid token structure');
    }
    catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid or expired token');
    }
};
exports.getUserId = getUserId;
