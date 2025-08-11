"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../services/auth");
const logger_1 = require("../config/logger");
const types_1 = require("../types");
class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password, profileType, company, location } = req.body;
            if (!name || !email || !password || !profileType) {
                throw new types_1.ValidationError('Nom, email, mot de passe et type de profil sont requis');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new types_1.ValidationError('Format d\'email invalide');
            }
            const validProfileTypes = ['PME', 'STARTUP', 'EXPERT', 'CONSULTANT', 'MENTOR', 'INCUBATOR', 'INVESTOR', 'FINANCIAL_INSTITUTION', 'PUBLIC_ORGANIZATION', 'TECH_PARTNER'];
            if (!validProfileTypes.includes(profileType)) {
                throw new types_1.ValidationError('Type de profil invalide');
            }
            const authResponse = await auth_1.AuthService.register({
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
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new types_1.ValidationError('Email et mot de passe sont requis');
            }
            const authResponse = await auth_1.AuthService.login({ email, password });
            logger_1.logger.info(`✅ User logged in: ${email}`);
            res.json({
                success: true,
                message: 'Connexion réussie',
                data: authResponse,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new types_1.ValidationError('Refresh token requis');
            }
            const tokens = await auth_1.AuthService.refreshTokens(refreshToken);
            res.json({
                success: true,
                message: 'Tokens rafraîchis avec succès',
                data: tokens,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            if (!req.user) {
                throw new types_1.UnauthorizedError('Utilisateur non authentifié');
            }
            await auth_1.AuthService.logout(req.user.id);
            res.json({
                success: true,
                message: 'Déconnexion réussie',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            if (!req.user) {
                throw new types_1.UnauthorizedError('Utilisateur non authentifié');
            }
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new types_1.ValidationError('Mot de passe actuel, nouveau mot de passe et confirmation requis');
            }
            if (newPassword !== confirmPassword) {
                throw new types_1.ValidationError('Les mots de passe ne correspondent pas');
            }
            if (currentPassword === newPassword) {
                throw new types_1.ValidationError('Le nouveau mot de passe doit être différent de l\'actuel');
            }
            await auth_1.AuthService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Mot de passe modifié avec succès',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new types_1.ValidationError('Email requis');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new types_1.ValidationError('Format d\'email invalide');
            }
            await auth_1.AuthService.requestPasswordReset(email);
            res.json({
                success: true,
                message: 'Si cette adresse email existe, un lien de réinitialisation a été envoyé',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { userId, resetToken, newPassword, confirmPassword } = req.body;
            if (!userId || !resetToken || !newPassword || !confirmPassword) {
                throw new types_1.ValidationError('Tous les champs sont requis');
            }
            if (newPassword !== confirmPassword) {
                throw new types_1.ValidationError('Les mots de passe ne correspondent pas');
            }
            await auth_1.AuthService.resetPassword(userId, resetToken, newPassword);
            res.json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new types_1.UnauthorizedError('Utilisateur non authentifié');
            }
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    expertises: true,
                },
            });
            if (!user) {
                throw new types_1.UnauthorizedError('Utilisateur non trouvé');
            }
            const userProfile = {
                id: user.id,
                email: user.email,
                name: user.name,
                profileType: user.profileType,
                status: user.status,
                company: user.company,
                location: user.location,
                avatar: user.avatar,
                description: user.description,
                website: user.website,
                linkedin: user.linkedin,
                phone: user.phone,
                verified: user.verified,
                completionScore: user.completionScore,
                rating: user.rating,
                reviewCount: user.reviewCount,
                expertises: user.expertises.map(exp => ({
                    id: exp.id,
                    name: exp.name,
                    level: exp.level,
                    verified: exp.verified,
                })),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
            };
            res.json({
                success: true,
                data: { user: userProfile },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyEmail(req, res, next) {
        try {
            const { userId, verificationToken } = req.body;
            if (!userId || !verificationToken) {
                throw new types_1.ValidationError('ID utilisateur et token de vérification requis');
            }
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            const user = await prisma.user.update({
                where: { id: userId },
                data: { verified: true },
            });
            res.json({
                success: true,
                message: 'Email vérifié avec succès',
                data: { verified: user.verified },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resendVerificationEmail(req, res, next) {
        try {
            if (!req.user) {
                throw new types_1.UnauthorizedError('Utilisateur non authentifié');
            }
            if (req.user.verified) {
                res.json({
                    success: true,
                    message: 'Email déjà vérifié',
                });
                return;
            }
            logger_1.logger.info(`📧 Verification email requested for user: ${req.user.email}`);
            res.json({
                success: true,
                message: 'Email de vérification envoyé',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
