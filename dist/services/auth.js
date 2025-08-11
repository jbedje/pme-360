"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = require("../config/logger");
const types_1 = require("../types");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async register(userData) {
        try {
            logger_1.logger.info(`📝 Starting registration for: ${userData.email}`);
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email.toLowerCase() },
            });
            if (existingUser) {
                logger_1.logger.warn(`⚠️  Registration attempt with existing email: ${userData.email}`);
                throw new types_1.ConflictError('Un compte avec cette adresse email existe déjà');
            }
            const passwordValidation = password_1.PasswordService.validatePasswordStrength(userData.password);
            if (!passwordValidation.isValid) {
                throw new types_1.ValidationError(passwordValidation.errors.join(', '));
            }
            const hashedPassword = await password_1.PasswordService.hash(userData.password);
            const newUser = await prisma.user.create({
                data: {
                    name: userData.name.trim(),
                    email: userData.email.toLowerCase().trim(),
                    password: hashedPassword,
                    profileType: userData.profileType,
                    company: userData.company?.trim(),
                    location: userData.location?.trim(),
                    verified: false,
                    completionScore: 25,
                },
            });
            logger_1.logger.info(`✅ User registered successfully: ${newUser.email}`);
            const jwtPayload = {
                userId: newUser.id,
                email: newUser.email,
                profileType: newUser.profileType,
                verified: newUser.verified,
            };
            const authResponse = jwt_1.JWTService.generateAuthResponse(jwtPayload);
            await this.storeRefreshToken(newUser.id, authResponse.tokens.refreshToken);
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    profileType: newUser.profileType,
                    status: newUser.status,
                    company: newUser.company,
                    location: newUser.location,
                    avatar: newUser.avatar,
                    description: newUser.description,
                    website: newUser.website,
                    linkedin: newUser.linkedin,
                    phone: newUser.phone,
                    verified: newUser.verified,
                    completionScore: newUser.completionScore,
                    rating: newUser.rating,
                    reviewCount: newUser.reviewCount,
                    expertises: [],
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt,
                    lastLogin: newUser.lastLogin,
                },
                tokens: authResponse.tokens,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Registration error:', error);
            throw error;
        }
    }
    static async login(credentials) {
        try {
            logger_1.logger.info(`🔐 Login attempt for: ${credentials.email}`);
            const user = await prisma.user.findUnique({
                where: { email: credentials.email.toLowerCase() },
                include: {
                    expertises: true,
                },
            });
            if (!user) {
                logger_1.logger.warn(`⚠️  Login attempt with non-existent email: ${credentials.email}`);
                throw new types_1.UnauthorizedError('Identifiants invalides');
            }
            const isPasswordValid = await password_1.PasswordService.verify(credentials.password, user.password);
            if (!isPasswordValid) {
                logger_1.logger.warn(`⚠️  Invalid password for user: ${credentials.email}`);
                throw new types_1.UnauthorizedError('Identifiants invalides');
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            });
            logger_1.logger.info(`✅ User logged in successfully: ${user.email}`);
            const jwtPayload = {
                userId: user.id,
                email: user.email,
                profileType: user.profileType,
                verified: user.verified,
            };
            const authResponse = jwt_1.JWTService.generateAuthResponse(jwtPayload);
            await this.storeRefreshToken(user.id, authResponse.tokens.refreshToken);
            return {
                user: {
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
                },
                tokens: authResponse.tokens,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Login error:', error);
            throw error;
        }
    }
    static async refreshTokens(refreshToken) {
        try {
            logger_1.logger.debug('🔄 Token refresh attempt');
            const decoded = jwt_1.JWTService.verifyRefreshToken(refreshToken);
            if (!decoded) {
                throw new types_1.UnauthorizedError('Refresh token invalide');
            }
            const storedToken = await redis_1.default.get(`refresh_token:${decoded.userId}`);
            if (!storedToken || storedToken !== refreshToken) {
                logger_1.logger.warn(`⚠️  Invalid refresh token for user: ${decoded.userId}`);
                throw new types_1.UnauthorizedError('Refresh token invalide ou expiré');
            }
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new types_1.NotFoundError('Utilisateur non trouvé');
            }
            const jwtPayload = {
                userId: user.id,
                email: user.email,
                profileType: user.profileType,
                verified: user.verified,
            };
            const authResponse = jwt_1.JWTService.generateAuthResponse(jwtPayload);
            await this.storeRefreshToken(user.id, authResponse.tokens.refreshToken);
            logger_1.logger.info(`✅ Tokens refreshed for user: ${user.email}`);
            return {
                tokens: authResponse.tokens,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Token refresh error:', error);
            throw error;
        }
    }
    static async logout(userId) {
        try {
            logger_1.logger.info(`🚪 Logout for user: ${userId}`);
            await redis_1.default.del(`refresh_token:${userId}`);
            logger_1.logger.info(`✅ User logged out successfully: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Logout error:', error);
            throw error;
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            logger_1.logger.info(`🔐 Password change attempt for user: ${userId}`);
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new types_1.NotFoundError('Utilisateur non trouvé');
            }
            const isCurrentPasswordValid = await password_1.PasswordService.verify(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new types_1.UnauthorizedError('Mot de passe actuel incorrect');
            }
            const passwordValidation = password_1.PasswordService.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                throw new types_1.ValidationError(passwordValidation.errors.join(', '));
            }
            const hashedNewPassword = await password_1.PasswordService.hash(newPassword);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
            await redis_1.default.del(`refresh_token:${userId}`);
            logger_1.logger.info(`✅ Password changed successfully for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Change password error:', error);
            throw error;
        }
    }
    static async requestPasswordReset(email) {
        try {
            logger_1.logger.info(`🔐 Password reset request for: ${email}`);
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                logger_1.logger.warn(`⚠️  Password reset request for non-existent user: ${email}`);
                return;
            }
            const resetToken = password_1.PasswordService.generateTempPassword(32);
            const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
            await redis_1.default.setex(`password_reset:${user.id}`, 3600, resetToken);
            logger_1.logger.info(`📧 Password reset token generated for user: ${user.email}`);
            logger_1.logger.debug(`Reset token: ${resetToken}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Password reset request error:', error);
            throw error;
        }
    }
    static async resetPassword(userId, resetToken, newPassword) {
        try {
            logger_1.logger.info(`🔐 Password reset attempt for user: ${userId}`);
            const storedToken = await redis_1.default.get(`password_reset:${userId}`);
            if (!storedToken || storedToken !== resetToken) {
                throw new types_1.UnauthorizedError('Token de réinitialisation invalide ou expiré');
            }
            const passwordValidation = password_1.PasswordService.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                throw new types_1.ValidationError(passwordValidation.errors.join(', '));
            }
            const hashedPassword = await password_1.PasswordService.hash(newPassword);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            await redis_1.default.del(`password_reset:${userId}`);
            await redis_1.default.del(`refresh_token:${userId}`);
            logger_1.logger.info(`✅ Password reset successfully for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Password reset error:', error);
            throw error;
        }
    }
    static async storeRefreshToken(userId, refreshToken) {
        try {
            await redis_1.default.setex(`refresh_token:${userId}`, 30 * 24 * 60 * 60, refreshToken);
        }
        catch (error) {
            logger_1.logger.error('❌ Error storing refresh token:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
