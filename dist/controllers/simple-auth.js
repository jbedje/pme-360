"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAuthController = void 0;
const simple_auth_1 = require("../services/simple-auth");
const logger_1 = require("../config/logger");
class SimpleAuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password, profileType, company, location } = req.body;
            if (!name || !email || !password || !profileType) {
                res.status(400).json({
                    success: false,
                    error: 'Nom, email, mot de passe et type de profil sont requis',
                });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    error: 'Format d\'email invalide',
                });
                return;
            }
            const validProfileTypes = ['PME', 'STARTUP', 'EXPERT', 'CONSULTANT', 'MENTOR', 'INCUBATOR', 'INVESTOR', 'FINANCIAL_INSTITUTION', 'PUBLIC_ORGANIZATION', 'TECH_PARTNER'];
            if (!validProfileTypes.includes(profileType)) {
                res.status(400).json({
                    success: false,
                    error: 'Type de profil invalide',
                });
                return;
            }
            const authResponse = await simple_auth_1.SimpleAuthService.register({
                name,
                email,
                password,
                profileType,
                company,
                location,
            });
            logger_1.logger.info(`✅ User registered: ${email}`);
            res.status(201).json({
                success: true,
                message: 'Inscription réussie',
                data: authResponse,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message || 'Erreur lors de l\'inscription',
            });
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Email et mot de passe sont requis',
                });
                return;
            }
            const authResponse = await simple_auth_1.SimpleAuthService.login({ email, password });
            logger_1.logger.info(`✅ User logged in: ${email}`);
            res.json({
                success: true,
                message: 'Connexion réussie',
                data: authResponse,
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: error.message || 'Erreur lors de la connexion',
            });
        }
    }
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
                return;
            }
            const userProfile = await simple_auth_1.SimpleAuthService.getUserById(req.user.id);
            res.json({
                success: true,
                data: { user: userProfile },
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error.message || 'Utilisateur non trouvé',
            });
        }
    }
}
exports.SimpleAuthController = SimpleAuthController;
