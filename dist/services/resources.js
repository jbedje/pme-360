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
exports.ResourcesService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ResourcesService {
    static async createResource(resourceData) {
        try {
            console.log(`📝 Creating resource: ${resourceData.title}`);
            let thumbnailUrl = resourceData.thumbnail;
            if (resourceData.thumbnailFile && resourceData.creatorId) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadResult = await FileUploadService.uploadFile(resourceData.thumbnailFile, FileType.RESOURCE_THUMBNAIL, resourceData.creatorId);
                thumbnailUrl = uploadResult.url;
            }
            const resource = await prisma.resource.create({
                data: {
                    title: resourceData.title,
                    description: resourceData.description,
                    content: resourceData.content,
                    url: resourceData.url,
                    thumbnail: thumbnailUrl,
                    type: resourceData.type,
                    author: resourceData.author,
                    isPremium: resourceData.isPremium || false,
                    tags: resourceData.tags ? {
                        create: resourceData.tags.map(tag => ({ tag }))
                    } : undefined,
                },
                include: {
                    tags: true,
                },
            });
            console.log(`✅ Resource created: ${resource.id}`);
            return resource;
        }
        catch (error) {
            console.error('❌ Create resource error:', error);
            throw error;
        }
    }
    static async getResources(filters, pagination) {
        try {
            console.log('📋 Getting resources with filters:', filters);
            const where = {};
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.author) {
                where.author = { contains: filters.author };
            }
            if (filters.isPremium !== undefined) {
                where.isPremium = filters.isPremium;
            }
            if (filters.search) {
                where.OR = [
                    { title: { contains: filters.search } },
                    { description: { contains: filters.search } },
                    { content: { contains: filters.search } },
                    { author: { contains: filters.search } },
                ];
            }
            if (filters.tags) {
                where.tags = {
                    some: {
                        tag: { contains: filters.tags },
                    },
                };
            }
            const total = await prisma.resource.count({ where });
            const resources = await prisma.resource.findMany({
                where,
                include: {
                    tags: true,
                },
                orderBy: {
                    [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                resources,
                meta: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total,
                    totalPages: Math.ceil(total / pagination.limit),
                    hasNext: pagination.page * pagination.limit < total,
                    hasPrev: pagination.page > 1,
                },
            };
        }
        catch (error) {
            console.error('❌ Get resources error:', error);
            throw error;
        }
    }
    static async getResourceById(resourceId, incrementView = false) {
        try {
            console.log(`📄 Getting resource ${resourceId}`);
            const resource = await prisma.resource.findUnique({
                where: { id: resourceId },
                include: {
                    tags: true,
                },
            });
            if (!resource) {
                throw new Error('Ressource non trouvée');
            }
            if (incrementView) {
                await prisma.resource.update({
                    where: { id: resourceId },
                    data: { viewCount: { increment: 1 } },
                });
                resource.viewCount += 1;
            }
            return resource;
        }
        catch (error) {
            console.error('❌ Get resource by ID error:', error);
            throw error;
        }
    }
    static async updateResource(resourceId, authorName, updateData) {
        try {
            console.log(`📝 Updating resource ${resourceId}`);
            const existingResource = await prisma.resource.findUnique({
                where: { id: resourceId },
            });
            if (!existingResource) {
                throw new Error('Ressource non trouvée');
            }
            if (existingResource.author !== authorName) {
                throw new Error('Non autorisé à modifier cette ressource');
            }
            let thumbnailUrl = updateData.thumbnail;
            if (updateData.thumbnailFile && updateData.creatorId) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadResult = await FileUploadService.uploadFile(updateData.thumbnailFile, FileType.RESOURCE_THUMBNAIL, updateData.creatorId);
                thumbnailUrl = uploadResult.url;
                if (existingResource.thumbnail) {
                    const publicId = existingResource.thumbnail.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        await FileUploadService.deleteFile(publicId);
                    }
                }
            }
            const resource = await prisma.resource.update({
                where: { id: resourceId },
                data: {
                    title: updateData.title,
                    description: updateData.description,
                    content: updateData.content,
                    url: updateData.url,
                    thumbnail: thumbnailUrl,
                    type: updateData.type,
                    author: updateData.author,
                    isPremium: updateData.isPremium,
                },
                include: {
                    tags: true,
                },
            });
            if (updateData.tags) {
                await prisma.resourceTag.deleteMany({
                    where: { resourceId },
                });
                await prisma.resourceTag.createMany({
                    data: updateData.tags.map(tag => ({
                        resourceId,
                        tag,
                    })),
                });
                return await this.getResourceById(resourceId);
            }
            console.log(`✅ Resource updated: ${resource.id}`);
            return resource;
        }
        catch (error) {
            console.error('❌ Update resource error:', error);
            throw error;
        }
    }
    static async deleteResource(resourceId, authorName) {
        try {
            console.log(`🗑️ Deleting resource ${resourceId}`);
            const existingResource = await prisma.resource.findUnique({
                where: { id: resourceId },
            });
            if (!existingResource) {
                throw new Error('Ressource non trouvée');
            }
            if (existingResource.author !== authorName) {
                throw new Error('Non autorisé à supprimer cette ressource');
            }
            await prisma.resource.delete({
                where: { id: resourceId },
            });
            console.log(`✅ Resource deleted: ${resourceId}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Delete resource error:', error);
            throw error;
        }
    }
    static async getResourcesByAuthor(authorName, pagination) {
        try {
            console.log(`📚 Getting resources by author: ${authorName}`);
            const total = await prisma.resource.count({
                where: { author: { contains: authorName } },
            });
            const resources = await prisma.resource.findMany({
                where: { author: { contains: authorName } },
                include: {
                    tags: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                resources,
                meta: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total,
                    totalPages: Math.ceil(total / pagination.limit),
                    hasNext: pagination.page * pagination.limit < total,
                    hasPrev: pagination.page > 1,
                },
            };
        }
        catch (error) {
            console.error('❌ Get resources by author error:', error);
            throw error;
        }
    }
    static async getPopularResources(pagination) {
        try {
            console.log('🔥 Getting popular resources');
            const resources = await prisma.resource.findMany({
                include: {
                    tags: true,
                },
                orderBy: { viewCount: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            const total = await prisma.resource.count();
            return {
                resources,
                meta: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total,
                    totalPages: Math.ceil(total / pagination.limit),
                    hasNext: pagination.page * pagination.limit < total,
                    hasPrev: pagination.page > 1,
                },
            };
        }
        catch (error) {
            console.error('❌ Get popular resources error:', error);
            throw error;
        }
    }
}
exports.ResourcesService = ResourcesService;
