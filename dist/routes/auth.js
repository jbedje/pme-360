"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        error: 'Trop de demandes de réinitialisation, veuillez réessayer dans 1 heure',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const registrationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: 'Trop d\'inscriptions, veuillez réessayer plus tard',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', registrationLimiter, auth_1.AuthController.register);
router.post('/login', authLimiter, auth_1.AuthController.login);
router.post('/refresh', auth_1.AuthController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, auth_1.AuthController.requestPasswordReset);
router.post('/reset-password', auth_1.AuthController.resetPassword);
router.post('/verify-email', auth_1.AuthController.verifyEmail);
router.post('/logout', auth_2.authenticateToken, auth_1.AuthController.logout);
router.get('/profile', auth_2.authenticateToken, auth_1.AuthController.getProfile);
router.post('/change-password', auth_2.authenticateToken, auth_1.AuthController.changePassword);
router.post('/resend-verification', auth_2.authenticateToken, auth_1.AuthController.resendVerificationEmail);
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    router.get('/test-protected', auth_2.authenticateToken, (req, res) => {
        res.json({
            success: true,
            message: 'Accès autorisé',
            user: req.user,
        });
    });
    router.get('/test-public', (req, res) => {
        res.json({
            success: true,
            message: 'Route publique accessible',
            timestamp: new Date().toISOString(),
        });
    });
}
exports.default = router;
