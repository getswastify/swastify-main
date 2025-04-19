"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        res.status(401).json({
            status: false,
            message: "Missing or invalid Authorization header.",
            error: {
                code: "ERR_NO_TOKEN",
                issue: "Expected Authorization: Bearer <token>"
            }
        });
    }
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (err) {
            res.status(401).json({
                status: false,
                message: "Token invalid or expired.",
                error: {
                    code: "ERR_TOKEN_INVALID",
                    issue: "JWT failed to verify"
                }
            });
        }
    }
};
exports.verifyToken = verifyToken;
