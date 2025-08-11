"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunitiesService = void 0;
const client_1 = require("@prisma/client");
const notifications_1 = require("./notifications");
const prisma = new client_1.PrismaClient();
class OpportunitiesService {
    static async createOpportunity(authorId, opportunityData) {
        try {
            console.log(`📝 Creating opportunity: ${opportunityData.title}`);
            const opportunity = await prisma.opportunity.create({
                data: {
                    authorId,
                    title: opportunityData.title,
                    description: opportunityData.description,
                    type: opportunityData.type,
                    budget: opportunityData.budget,
                    amount: opportunityData.amount,
                    location: opportunityData.location,
                    remote: opportunityData.remote || false,
                    deadline: opportunityData.deadline,
                    startDate: opportunityData.startDate,
                    experience: opportunityData.experience,
                    skills: opportunityData.skills ? {
                        create: opportunityData.skills.map(skill => ({ skill }))
                    } : undefined,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                        },
                    },
                    skills: true,
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            console.log(`✅ Opportunity created: ${opportunity.id}`);
            return opportunity;
        }
        catch (error) {
            console.error('❌ Create opportunity error:', error);
            throw error;
        }
    }
    static async getOpportunities(filters, pagination) {
        try {
            console.log('📋 Getting opportunities with filters:', filters);
            const where = {
                status: client_1.OpportunityStatus.ACTIVE,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.location) {
                where.location = { contains: filters.location };
            }
            if (filters.remote !== undefined) {
                where.remote = filters.remote;
            }
            if (filters.authorId) {
                where.authorId = filters.authorId;
            }
            if (filters.search) {
                where.OR = [
                    { title: { contains: filters.search } },
                    { description: { contains: filters.search } },
                    { author: { name: { contains: filters.search } } },
                    { author: { company: { contains: filters.search } } },
                ];
            }
            if (filters.skills) {
                where.skills = {
                    some: {
                        skill: { contains: filters.skills },
                    },
                };
            }
            const total = await prisma.opportunity.count({ where });
            const opportunities = await prisma.opportunity.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                            location: true,
                        },
                    },
                    skills: true,
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
                orderBy: {
                    [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                opportunities,
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
            console.error('❌ Get opportunities error:', error);
            throw error;
        }
    }
    static async getOpportunityById(opportunityId, userId) {
        try {
            console.log(`📄 Getting opportunity ${opportunityId}`);
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                            location: true,
                            description: true,
                            website: true,
                            linkedin: true,
                        },
                    },
                    skills: true,
                    applications: userId ? {
                        where: { applicantId: userId },
                        include: {
                            applicant: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    } : false,
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            if (!opportunity) {
                throw new Error('Opportunité non trouvée');
            }
            return opportunity;
        }
        catch (error) {
            console.error('❌ Get opportunity by ID error:', error);
            throw error;
        }
    }
    static async updateOpportunity(opportunityId, authorId, updateData) {
        try {
            console.log(`📝 Updating opportunity ${opportunityId}`);
            const existingOpportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
            });
            if (!existingOpportunity) {
                throw new Error('Opportunité non trouvée');
            }
            if (existingOpportunity.authorId !== authorId) {
                throw new Error('Non autorisé à modifier cette opportunité');
            }
            const opportunity = await prisma.opportunity.update({
                where: { id: opportunityId },
                data: {
                    title: updateData.title,
                    description: updateData.description,
                    type: updateData.type,
                    budget: updateData.budget,
                    amount: updateData.amount,
                    location: updateData.location,
                    remote: updateData.remote,
                    deadline: updateData.deadline,
                    startDate: updateData.startDate,
                    experience: updateData.experience,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                        },
                    },
                    skills: true,
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            if (updateData.skills) {
                await prisma.opportunitySkill.deleteMany({
                    where: { opportunityId },
                });
                await prisma.opportunitySkill.createMany({
                    data: updateData.skills.map(skill => ({
                        opportunityId,
                        skill,
                    })),
                });
                return await this.getOpportunityById(opportunityId);
            }
            console.log(`✅ Opportunity updated: ${opportunity.id}`);
            return opportunity;
        }
        catch (error) {
            console.error('❌ Update opportunity error:', error);
            throw error;
        }
    }
    static async deleteOpportunity(opportunityId, authorId) {
        try {
            console.log(`🗑️ Deleting opportunity ${opportunityId}`);
            const existingOpportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
            });
            if (!existingOpportunity) {
                throw new Error('Opportunité non trouvée');
            }
            if (existingOpportunity.authorId !== authorId) {
                throw new Error('Non autorisé à supprimer cette opportunité');
            }
            await prisma.opportunity.delete({
                where: { id: opportunityId },
            });
            console.log(`✅ Opportunity deleted: ${opportunityId}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Delete opportunity error:', error);
            throw error;
        }
    }
    static async applyToOpportunity(opportunityId, applicantId, applicationData) {
        try {
            console.log(`📮 Applying to opportunity ${opportunityId}`);
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
            });
            if (!opportunity) {
                throw new Error('Opportunité non trouvée');
            }
            if (opportunity.status !== client_1.OpportunityStatus.ACTIVE) {
                throw new Error('Cette opportunité n\'est plus active');
            }
            if (opportunity.authorId === applicantId) {
                throw new Error('Vous ne pouvez pas postuler à votre propre opportunité');
            }
            const existingApplication = await prisma.application.findUnique({
                where: {
                    opportunityId_applicantId: {
                        opportunityId,
                        applicantId,
                    },
                },
            });
            if (existingApplication) {
                throw new Error('Vous avez déjà postulé à cette opportunité');
            }
            const application = await prisma.application.create({
                data: {
                    opportunityId,
                    applicantId,
                    coverLetter: applicationData.coverLetter,
                    proposedRate: applicationData.proposedRate,
                    availability: applicationData.availability,
                },
                include: {
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                            location: true,
                        },
                    },
                    opportunity: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            author: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            console.log(`✅ Application created: ${application.id}`);
            try {
                const applicant = await prisma.user.findUnique({
                    where: { id: applicantId },
                    select: { name: true }
                });
                if (applicant) {
                    await notifications_1.NotificationsService.createNotification({
                        userId: opportunity.authorId,
                        type: 'APPLICATION_UPDATE',
                        title: 'Nouvelle candidature reçue',
                        message: `${applicant.name} a postulé pour votre opportunité "${opportunity.title}"`,
                        actionUrl: `/opportunities/${opportunityId}/applications`,
                        data: { opportunityId, applicationId: application.id }
                    });
                }
            }
            catch (notificationError) {
                console.error('❌ Failed to create application notification:', notificationError);
            }
            return application;
        }
        catch (error) {
            console.error('❌ Apply to opportunity error:', error);
            throw error;
        }
    }
    static async getApplications(opportunityId, authorId, pagination) {
        try {
            console.log(`📋 Getting applications for opportunity ${opportunityId}`);
            const opportunity = await prisma.opportunity.findUnique({
                where: { id: opportunityId },
            });
            if (!opportunity) {
                throw new Error('Opportunité non trouvée');
            }
            if (opportunity.authorId !== authorId) {
                throw new Error('Non autorisé à voir les candidatures');
            }
            const total = await prisma.application.count({
                where: { opportunityId },
            });
            const applications = await prisma.application.findMany({
                where: { opportunityId },
                include: {
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                            location: true,
                            description: true,
                            website: true,
                            linkedin: true,
                            rating: true,
                            reviewCount: true,
                            expertises: true,
                        },
                    },
                    attachments: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                applications,
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
            console.error('❌ Get applications error:', error);
            throw error;
        }
    }
    static async getUserApplications(userId, pagination) {
        try {
            console.log(`📋 Getting applications for user ${userId}`);
            const total = await prisma.application.count({
                where: { applicantId: userId },
            });
            const applications = await prisma.application.findMany({
                where: { applicantId: userId },
                include: {
                    opportunity: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                    company: true,
                                },
                            },
                            skills: true,
                        },
                    },
                    attachments: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                applications,
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
            console.error('❌ Get user applications error:', error);
            throw error;
        }
    }
}
exports.OpportunitiesService = OpportunitiesService;
