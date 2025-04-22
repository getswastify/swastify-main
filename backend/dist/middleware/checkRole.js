"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        if (user && user.role !== role) {
            res.status(403).json({
                status: false,
                message: `Access denied. Requires role: ${role}`,
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
