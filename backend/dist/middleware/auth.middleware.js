"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.auth_token;
        if (!token) {
            res.status(401).json({
                status: false,
                message: "Authentication required.",
                error: {
                    code: "ERR_AUTH_REQUIRED",
                    issue: "No authentication token provided",
                },
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Add user data to request
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            status: false,
            message: "Invalid or expired token.",
            error: {
                code: "ERR_INVALID_TOKEN",
                issue: "The authentication token is invalid or expired",
            },
        });
    }
};
exports.authMiddleware = authMiddleware;
// Role-based middleware
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: "Authentication required.",
                error: {
                    code: "ERR_AUTH_REQUIRED",
                    issue: "No authentication token provided",
                },
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: false,
                message: "Access denied.",
                error: {
                    code: "ERR_ACCESS_DENIED",
                    issue: "You don't have permission to access this resource",
                },
            });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
