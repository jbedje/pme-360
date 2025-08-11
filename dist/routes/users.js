"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const simple_auth_1 = require("../middleware/simple-auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const userActionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        error: 'Trop d\'actions, veuillez réessayer plus tard',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.get('/', simple_auth_1.optionalAuth, users_1.UsersController.getAllUsers);
router.get('/:userId', simple_auth_1.optionalAuth, users_1.UsersController.getUserById);
router.get('/me/profile', simple_auth_1.authenticateToken, users_1.UsersController.getUserById);
router.put('/me', simple_auth_1.authenticateToken, userActionLimiter, users_1.UsersController.updateCurrentUser);
router.put('/:userId', simple_auth_1.authenticateToken, userActionLimiter, users_1.UsersController.updateUser);
router.delete('/me', simple_auth_1.authenticateToken, userActionLimiter, users_1.UsersController.deleteCurrentUser);
router.post('/me/expertises', simple_auth_1.authenticateToken, userActionLimiter, users_1.UsersController.addExpertise);
router.delete('/me/expertises/:expertiseId', simple_auth_1.authenticateToken, userActionLimiter, users_1.UsersController.removeExpertise);
exports.default = router;
