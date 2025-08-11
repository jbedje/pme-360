import { NotificationType } from '@prisma/client';
export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
}
export interface NotificationFilters {
    type?: NotificationType;
    read?: boolean;
    search?: string;
}
export interface NotificationPagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class NotificationsService {
    static createNotification(notificationData: CreateNotificationData): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static getUserNotifications(userId: string, filters: NotificationFilters | undefined, pagination: NotificationPagination): Promise<{
        notifications: {
            data: any;
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            read: boolean;
            actionUrl: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static markAsRead(notificationId: string, userId: string): Promise<{
        data: any;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    static deleteNotification(notificationId: string, userId: string): Promise<{
        success: boolean;
    }>;
    static getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    static deleteOldNotifications(olderThanDays?: number): Promise<{
        deletedCount: number;
    }>;
    static createMessageNotification(recipientId: string, senderName: string, messagePreview: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static createConnectionRequestNotification(targetId: string, requesterName: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static createOpportunityMatchNotification(userId: string, opportunityTitle: string, opportunityId: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static createApplicationUpdateNotification(applicantId: string, opportunityTitle: string, status: string, opportunityId: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static createEventReminderNotification(userId: string, eventTitle: string, eventDate: Date, eventId: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    static createSystemNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        data: string | null;
        userId: string;
        title: string;
        read: boolean;
        actionUrl: string | null;
    }>;
    private static emitRealTimeNotification;
}
//# sourceMappingURL=notifications.d.ts.map