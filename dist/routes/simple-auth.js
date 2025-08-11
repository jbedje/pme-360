"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simple_auth_1 = require("../controllers/simple-auth");
const simple_auth_2 = require("../middleware/simple-auth");
const router = (0, express_1.Router)();
router.post('/register', simple_auth_1.SimpleAuthController.register);
router.post('/login', simple_auth_1.SimpleAuthController.login);
router.get('/profile', simple_auth_2.authenticateToken, simple_auth_1.SimpleAuthController.getProfile);
router.get('/test-protected', simple_auth_2.authenticateToken, (req, res) => {
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
exports.default = router;
