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
exports.UsersService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class UsersService {
    static async getAllUsers(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = pagination;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.profileType) {
                where.profileType = filters.profileType;
            }
            if (filters.location) {
                where.location = {
                    contains: filters.location,
                    mode: 'insensitive',
                };
            }
            if (filters.verified !== undefined) {
                where.verified = filters.verified;
            }
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { company: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileType: true,
                        status: true,
                        company: true,
                        location: true,
                        avatar: true,
                        description: true,
                        website: true,
                        linkedin: true,
                        verified: true,
                        completionScore: true,
                        rating: true,
                        reviewCount: true,
                        createdAt: true,
                        updatedAt: true,
                        lastLogin: true,
                    },
                }),
                prisma.user.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                users,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Get users error:', error);
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
    }
    static async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    expertises: true,
                    _count: {
                        select: {
                            connections: true,
                            connectedTo: true,
                            opportunities: true,
                            applications: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            return {
                id: user.id,
                name: user.name,
                email: user.email,
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
                stats: {
                    connectionsCount: user._count.connections + user._count.connectedTo,
                    opportunitiesCount: user._count.opportunities,
                    applicationsCount: user._count.applications,
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Get user by ID error:', error);
            throw error;
        }
    }
    static async updateUser(userId, updateData) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!existingUser) {
                throw new Error('Utilisateur non trouvé');
            }
            let avatarUrl = updateData.avatar;
            if (updateData.avatarFile) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadResult = await FileUploadService.uploadFile(updateData.avatarFile, FileType.AVATAR, userId);
                avatarUrl = uploadResult.url;
                if (existingUser.avatar) {
                    const publicId = existingUser.avatar.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        await FileUploadService.deleteFile(publicId);
                    }
                }
            }
            const { avatarFile, ...updateDataWithoutFile } = updateData;
            const finalUpdateData = {
                ...updateDataWithoutFile,
                avatar: avatarUrl,
            };
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: finalUpdateData,
                include: {
                    expertises: true,
                },
            });
            const completionScore = this.calculateCompletionScore(updatedUser);
            if (completionScore !== updatedUser.completionScore) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { completionScore },
                });
            }
            logger_1.logger.info(`✅ User updated successfully: ${updatedUser.email}`);
            return {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileType: updatedUser.profileType,
                status: updatedUser.status,
                company: updatedUser.company,
                location: updatedUser.location,
                avatar: updatedUser.avatar,
                description: updatedUser.description,
                website: updatedUser.website,
                linkedin: updatedUser.linkedin,
                phone: updatedUser.phone,
                verified: updatedUser.verified,
                completionScore,
                rating: updatedUser.rating,
                reviewCount: updatedUser.reviewCount,
                expertises: updatedUser.expertises.map(exp => ({
                    id: exp.id,
                    name: exp.name,
                    level: exp.level,
                    verified: exp.verified,
                })),
                updatedAt: updatedUser.updatedAt,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Update user error:', error);
            throw error;
        }
    }
    static async deleteUser(userId) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!existingUser) {
                throw new Error('Utilisateur non trouvé');
            }
            await prisma.user.delete({
                where: { id: userId },
            });
            logger_1.logger.info(`✅ User deleted successfully: ${existingUser.email}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Delete user error:', error);
            throw error;
        }
    }
    static async addExpertise(userId, expertiseData) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            const existingExpertise = await prisma.userExpertise.findFirst({
                where: {
                    userId,
                    name: expertiseData.name,
                },
            });
            if (existingExpertise) {
                throw new Error('Cette expertise existe déjà pour cet utilisateur');
            }
            const expertise = await prisma.userExpertise.create({
                data: {
                    userId,
                    name: expertiseData.name,
                    level: Math.min(Math.max(expertiseData.level, 1), 5),
                },
            });
            logger_1.logger.info(`✅ Expertise added for user: ${userId}`);
            return {
                id: expertise.id,
                name: expertise.name,
                level: expertise.level,
                verified: expertise.verified,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Add expertise error:', error);
            throw error;
        }
    }
    static async removeExpertise(userId, expertiseId) {
        try {
            const expertise = await prisma.userExpertise.findFirst({
                where: {
                    id: expertiseId,
                    userId,
                },
            });
            if (!expertise) {
                throw new Error('Expertise non trouvée');
            }
            await prisma.userExpertise.delete({
                where: { id: expertiseId },
            });
            logger_1.logger.info(`✅ Expertise removed for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Remove expertise error:', error);
            throw error;
        }
    }
    static calculateCompletionScore(user) {
        let score = 30;
        if (user.company)
            score += 10;
        if (user.location)
            score += 10;
        if (user.description)
            score += 15;
        if (user.website)
            score += 5;
        if (user.linkedin)
            score += 5;
        if (user.phone)
            score += 5;
        if (user.avatar)
            score += 10;
        if (user.expertises) {
            score += Math.min(user.expertises.length * 2, 10);
        }
        return Math.min(score, 100);
    }
}
exports.UsersService = UsersService;
