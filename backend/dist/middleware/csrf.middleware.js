"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customCsrfProtection = void 0;
// csrf.middleware.ts
function customCsrfProtection(req, res, next) {
    const csrfCookie = req.signedCookies.csrf;
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({
            status: false,
            message: 'CSRF token mismatch',
            error: {
                code: 'CSRF_MISMATCH',
                issue: 'Invalid CSRF token'
            }
        });
    }
    next();
}
exports.customCsrfProtection = customCsrfProtection;
