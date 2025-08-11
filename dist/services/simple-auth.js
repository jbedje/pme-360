"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAuthService = void 0;
const client_1 = require("@prisma/client");
const simple_jwt_1 = require("../utils/simple-jwt");
const password_1 = require("../utils/password");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class SimpleAuthService {
    static async register(userData) {
        try {
            logger_1.logger.info(`📝 Starting registration for: ${userData.email}`);
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email.toLowerCase() },
            });
            if (existingUser) {
                logger_1.logger.warn(`⚠️ Registration attempt with existing email: ${userData.email}`);
                throw new Error('Un compte avec cette adresse email existe déjà');
            }
            const passwordValidation = password_1.PasswordService.validatePasswordStrength(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors.join(', '));
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
            const authResponse = simple_jwt_1.SimpleJWTService.generateAuthResponse({
                userId: newUser.id,
                email: newUser.email,
                profileType: newUser.profileType,
                verified: newUser.verified,
            });
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    profileType: newUser.profileType,
                    status: newUser.status,
                    company: newUser.company,
                    location: newUser.location,
                    verified: newUser.verified,
                    completionScore: newUser.completionScore,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt,
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
            });
            if (!user) {
                logger_1.logger.warn(`⚠️ Login attempt with non-existent email: ${credentials.email}`);
                throw new Error('Identifiants invalides');
            }
            const isPasswordValid = await password_1.PasswordService.verify(credentials.password, user.password);
            if (!isPasswordValid) {
                logger_1.logger.warn(`⚠️ Invalid password for user: ${credentials.email}`);
                throw new Error('Identifiants invalides');
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            });
            logger_1.logger.info(`✅ User logged in successfully: ${user.email}`);
            const authResponse = simple_jwt_1.SimpleJWTService.generateAuthResponse({
                userId: user.id,
                email: user.email,
                profileType: user.profileType,
                verified: user.verified,
            });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profileType: user.profileType,
                    status: user.status,
                    company: user.company,
                    location: user.location,
                    verified: user.verified,
                    completionScore: user.completionScore,
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
    static async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    expertises: true,
                },
            });
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            return {
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
        }
        catch (error) {
            logger_1.logger.error('❌ Get user error:', error);
            throw error;
        }
    }
}
exports.SimpleAuthService = SimpleAuthService;
