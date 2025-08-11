export interface PlatformStats {
    users: {
        total: number;
        active: number;
        byProfileType: Record<string, number>;
        newThisMonth: number;
    };
    opportunities: {
        total: number;
        active: number;
        byType: Record<string, number>;
        applicationsCount: number;
    };
    events: {
        total: number;
        upcoming: number;
        byType: Record<string, number>;
        registrationsCount: number;
    };
    resources: {
        total: number;
        byType: Record<string, number>;
        totalViews: number;
    };
    messages: {
        total: number;
        thisMonth: number;
    };
    connections: {
        total: number;
        thisMonth: number;
    };
}
export interface UserActivityMetrics {
    userId: string;
    period: 'week' | 'month' | 'year';
    stats: {
        opportunitiesCreated: number;
        opportunitiesApplied: number;
        eventsCreated: number;
        eventsAttended: number;
        resourcesCreated: number;
        resourcesViewed: number;
        messagesSent: number;
        messagesReceived: number;
        connectionsEstablished: number;
        profileViews: number;
    };
}
export declare class AnalyticsService {
    static getPlatformStats(): Promise<PlatformStats>;
    static getUserActivityMetrics(userId: string, period?: 'week' | 'month' | 'year'): Promise<UserActivityMetrics>;
    static getEngagementMetrics(): Promise<{
        userEngagement: {
            totalUsers: number;
            activeUsers: number;
            engagementRate: number;
        };
        opportunityConversion: {
            totalOpportunities: number;
            totalApplications: number;
            applicationRate: number;
        };
        eventParticipation: {
            totalEvents: number;
            totalEventRegistrations: number;
            participationRate: number;
        };
        resourcePopularity: {
            popularResources: {
                type: import(".prisma/client").$Enums.ResourceType;
                id: string;
                title: string;
                author: string;
                viewCount: number;
            }[];
        };
        messagingActivity: {
            messagesLastMonth: number;
            readMessages: number;
            readRate: number;
        };
    }>;
    static getTimeTrends(days?: number): Promise<{
        trends: {
            date: string;
            newUsers: number;
            newOpportunities: number;
            newEvents: number;
            newMessages: number;
            newConnections: number;
        }[];
        period: string;
    }>;
    static getUsageStatistics(): Promise<{
        mostActiveUsers: {
            name: string;
            id: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            completionScore: number;
            lastLogin: Date | null;
        }[];
        popularOpportunities: {
            applicationCount: number;
            type: import(".prisma/client").$Enums.OpportunityType;
            id: string;
            createdAt: Date;
            title: string;
        }[];
        popularEvents: {
            registrationCount: number;
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            title: string;
            startDate: Date;
            maxAttendees: number | null;
        }[];
        locationDistribution: {
            location: string;
            userCount: number;
        }[];
    }>;
}
//# sourceMappingURL=analytics.d.ts.map