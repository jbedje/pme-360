"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class AnalyticsService {
    static async getPlatformStats() {
        try {
            logger_1.logger.info('📊 Generating platform statistics...');
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const [totalUsers, activeUsers, newUsersThisMonth,] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({
                    where: {
                        lastLogin: { gte: thirtyDaysAgo },
                    },
                }),
                prisma.user.count({
                    where: {
                        createdAt: { gte: thisMonth },
                    },
                }),
            ]);
            const usersByType = await prisma.user.groupBy({
                by: ['profileType'],
                _count: { _all: true },
            });
            const [totalOpportunities, activeOpportunities, totalApplications,] = await Promise.all([
                prisma.opportunity.count(),
                prisma.opportunity.count({
                    where: { status: 'ACTIVE' },
                }),
                prisma.application.count(),
            ]);
            const opportunitiesByType = await prisma.opportunity.groupBy({
                by: ['type'],
                _count: { _all: true },
            });
            const [totalEvents, upcomingEvents, totalRegistrations,] = await Promise.all([
                prisma.event.count(),
                prisma.event.count({
                    where: {
                        status: 'UPCOMING',
                        startDate: { gte: now },
                    },
                }),
                prisma.eventRegistration.count(),
            ]);
            const eventsByType = await prisma.event.groupBy({
                by: ['type'],
                _count: { _all: true },
            });
            const [totalResources, totalViews,] = await Promise.all([
                prisma.resource.count(),
                prisma.resource.aggregate({
                    _sum: { viewCount: true },
                }),
            ]);
            const resourcesByType = await prisma.resource.groupBy({
                by: ['type'],
                _count: { _all: true },
            });
            const [totalMessages, messagesThisMonth, totalConnections, connectionsThisMonth,] = await Promise.all([
                prisma.message.count(),
                prisma.message.count({
                    where: {
                        createdAt: { gte: thisMonth },
                    },
                }),
                prisma.connection.count(),
                prisma.connection.count({
                    where: {
                        createdAt: { gte: thisMonth },
                    },
                }),
            ]);
            const stats = {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    byProfileType: usersByType.reduce((acc, item) => {
                        acc[item.profileType] = item._count._all;
                        return acc;
                    }, {}),
                    newThisMonth: newUsersThisMonth,
                },
                opportunities: {
                    total: totalOpportunities,
                    active: activeOpportunities,
                    byType: opportunitiesByType.reduce((acc, item) => {
                        acc[item.type] = item._count._all;
                        return acc;
                    }, {}),
                    applicationsCount: totalApplications,
                },
                events: {
                    total: totalEvents,
                    upcoming: upcomingEvents,
                    byType: eventsByType.reduce((acc, item) => {
                        acc[item.type] = item._count._all;
                        return acc;
                    }, {}),
                    registrationsCount: totalRegistrations,
                },
                resources: {
                    total: totalResources,
                    byType: resourcesByType.reduce((acc, item) => {
                        acc[item.type] = item._count._all;
                        return acc;
                    }, {}),
                    totalViews: totalViews._sum.viewCount || 0,
                },
                messages: {
                    total: totalMessages,
                    thisMonth: messagesThisMonth,
                },
                connections: {
                    total: totalConnections,
                    thisMonth: connectionsThisMonth,
                },
            };
            logger_1.logger.info('✅ Platform statistics generated successfully');
            return stats;
        }
        catch (error) {
            logger_1.logger.error('❌ Platform statistics generation failed:', error);
            throw error;
        }
    }
    static async getUserActivityMetrics(userId, period = 'month') {
        try {
            logger_1.logger.info(`📊 Generating activity metrics for user ${userId} (${period})`);
            const now = new Date();
            let startDate;
            switch (period) {
                case 'week':
                    startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            const [opportunitiesCreated, opportunitiesApplied, eventsCreated, eventsAttended, resourcesCreated, messagesSent, messagesReceived, connectionsEstablished,] = await Promise.all([
                prisma.opportunity.count({
                    where: {
                        authorId: userId,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.application.count({
                    where: {
                        applicantId: userId,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.event.count({
                    where: {
                        organizer: user.name,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.eventRegistration.count({
                    where: {
                        userId,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.resource.count({
                    where: {
                        author: user.name,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.message.count({
                    where: {
                        senderId: userId,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.message.count({
                    where: {
                        recipientId: userId,
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.connection.count({
                    where: {
                        OR: [
                            { requesterId: userId },
                            { targetId: userId },
                        ],
                        status: 'ACCEPTED',
                        createdAt: { gte: startDate },
                    },
                }),
            ]);
            const stats = {
                userId,
                period,
                stats: {
                    opportunitiesCreated,
                    opportunitiesApplied,
                    eventsCreated,
                    eventsAttended,
                    resourcesCreated,
                    resourcesViewed: 0,
                    messagesSent,
                    messagesReceived,
                    connectionsEstablished,
                    profileViews: 0,
                },
            };
            logger_1.logger.info(`✅ User activity metrics generated for ${userId}`);
            return stats;
        }
        catch (error) {
            logger_1.logger.error(`❌ User activity metrics generation failed for ${userId}:`, error);
            throw error;
        }
    }
    static async getEngagementMetrics() {
        try {
            logger_1.logger.info('📊 Generating engagement metrics...');
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const totalUsers = await prisma.user.count();
            const activeUsers = await prisma.user.count({
                where: {
                    lastLogin: { gte: thirtyDaysAgo },
                },
            });
            const totalOpportunities = await prisma.opportunity.count({
                where: { status: 'ACTIVE' },
            });
            const totalApplications = await prisma.application.count();
            const totalEvents = await prisma.event.count({
                where: { status: 'UPCOMING' },
            });
            const totalEventRegistrations = await prisma.eventRegistration.count();
            const popularResources = await prisma.resource.findMany({
                orderBy: { viewCount: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    type: true,
                    viewCount: true,
                    author: true,
                },
            });
            const messagesLastMonth = await prisma.message.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                },
            });
            const readMessages = await prisma.message.count({
                where: {
                    readAt: { not: null },
                    createdAt: { gte: thirtyDaysAgo },
                },
            });
            const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
            const applicationRate = totalOpportunities > 0 ? (totalApplications / totalOpportunities) : 0;
            const eventParticipationRate = totalEvents > 0 ? (totalEventRegistrations / totalEvents) : 0;
            const messageReadRate = messagesLastMonth > 0 ? (readMessages / messagesLastMonth) * 100 : 0;
            return {
                userEngagement: {
                    totalUsers,
                    activeUsers,
                    engagementRate: Math.round(engagementRate * 100) / 100,
                },
                opportunityConversion: {
                    totalOpportunities,
                    totalApplications,
                    applicationRate: Math.round(applicationRate * 100) / 100,
                },
                eventParticipation: {
                    totalEvents,
                    totalEventRegistrations,
                    participationRate: Math.round(eventParticipationRate * 100) / 100,
                },
                resourcePopularity: {
                    popularResources,
                },
                messagingActivity: {
                    messagesLastMonth,
                    readMessages,
                    readRate: Math.round(messageReadRate * 100) / 100,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Engagement metrics generation failed:', error);
            throw error;
        }
    }
    static async getTimeTrends(days = 30) {
        try {
            logger_1.logger.info(`📊 Generating time trends for ${days} days...`);
            const now = new Date();
            const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            const trends = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
                const nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                const [newUsers, newOpportunities, newEvents, newMessages, newConnections,] = await Promise.all([
                    prisma.user.count({
                        where: {
                            createdAt: {
                                gte: date,
                                lt: nextDate,
                            },
                        },
                    }),
                    prisma.opportunity.count({
                        where: {
                            createdAt: {
                                gte: date,
                                lt: nextDate,
                            },
                        },
                    }),
                    prisma.event.count({
                        where: {
                            createdAt: {
                                gte: date,
                                lt: nextDate,
                            },
                        },
                    }),
                    prisma.message.count({
                        where: {
                            createdAt: {
                                gte: date,
                                lt: nextDate,
                            },
                        },
                    }),
                    prisma.connection.count({
                        where: {
                            createdAt: {
                                gte: date,
                                lt: nextDate,
                            },
                        },
                    }),
                ]);
                trends.push({
                    date: date.toISOString().split('T')[0],
                    newUsers,
                    newOpportunities,
                    newEvents,
                    newMessages,
                    newConnections,
                });
            }
            logger_1.logger.info(`✅ Time trends generated for ${days} days`);
            return { trends, period: `${days} days` };
        }
        catch (error) {
            logger_1.logger.error('❌ Time trends generation failed:', error);
            throw error;
        }
    }
    static async getUsageStatistics() {
        try {
            logger_1.logger.info('📊 Generating usage statistics...');
            const mostActiveUsers = await prisma.user.findMany({
                orderBy: { lastLogin: 'desc' },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    profileType: true,
                    lastLogin: true,
                    completionScore: true,
                },
            });
            const allOpportunities = await prisma.opportunity.findMany({
                select: {
                    id: true,
                    title: true,
                    type: true,
                    createdAt: true,
                },
            });
            const opportunitiesWithCounts = await Promise.all(allOpportunities.map(async (opportunity) => {
                const applicationCount = await prisma.application.count({
                    where: { opportunityId: opportunity.id },
                });
                return {
                    ...opportunity,
                    applicationCount,
                };
            }));
            const popularOpportunities = opportunitiesWithCounts
                .sort((a, b) => b.applicationCount - a.applicationCount)
                .slice(0, 10);
            const allEvents = await prisma.event.findMany({
                select: {
                    id: true,
                    title: true,
                    type: true,
                    startDate: true,
                    maxAttendees: true,
                },
            });
            const eventsWithCounts = await Promise.all(allEvents.map(async (event) => {
                const registrationCount = await prisma.eventRegistration.count({
                    where: { eventId: event.id },
                });
                return {
                    ...event,
                    registrationCount,
                };
            }));
            const popularEvents = eventsWithCounts
                .sort((a, b) => b.registrationCount - a.registrationCount)
                .slice(0, 10);
            const allUsers = await prisma.user.findMany({
                where: {
                    location: { not: null },
                },
                select: { location: true },
            });
            const locationDistribution = allUsers.reduce((acc, user) => {
                if (user.location) {
                    acc[user.location] = (acc[user.location] || 0) + 1;
                }
                return acc;
            }, {});
            const topLocations = Object.entries(locationDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([location, userCount]) => ({ location, userCount }));
            return {
                mostActiveUsers,
                popularOpportunities,
                popularEvents,
                locationDistribution: topLocations,
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Usage statistics generation failed:', error);
            throw error;
        }
    }
}
exports.AnalyticsService = AnalyticsService;
