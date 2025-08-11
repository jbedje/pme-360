import { MessageType } from '@prisma/client';
export interface SendMessageData {
    recipientId: string;
    subject: string;
    content: string;
    type?: MessageType;
    parentId?: string;
    attachmentFiles?: Express.Multer.File[];
}
export interface MessageFilters {
    type?: string;
    status?: string;
    search?: string;
    conversationId?: string;
}
export interface MessagePagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class MessagingService {
    static sendMessage(senderId: string, messageData: SendMessageData): Promise<{
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        readAt: Date | null;
        conversationId: string;
        senderId: string;
        recipientId: string | null;
    }>;
    static getMessages(userId: string, filters: MessageFilters, pagination: MessagePagination, type?: 'received' | 'sent'): Promise<{
        messages: {
            type: import(".prisma/client").$Enums.MessageType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            readAt: Date | null;
            conversationId: string;
            senderId: string;
            recipientId: string | null;
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
    static getMessageById(messageId: string, userId: string): Promise<{
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        readAt: Date | null;
        conversationId: string;
        senderId: string;
        recipientId: string | null;
    }>;
    static markAsRead(messageId: string, userId: string): Promise<{
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        readAt: Date | null;
        conversationId: string;
        senderId: string;
        recipientId: string | null;
    }>;
    static deleteMessage(messageId: string, userId: string): Promise<{
        success: boolean;
    }>;
    static getConversations(userId: string, pagination: MessagePagination): Promise<{
        conversations: {
            otherUser: {
                name: string;
                id: string;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                status: import(".prisma/client").$Enums.UserStatus;
                avatar: string | null;
            } | null;
            lastMessage: ({
                sender: {
                    name: string;
                };
            } & {
                type: import(".prisma/client").$Enums.MessageType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                content: string;
                readAt: Date | null;
                conversationId: string;
                senderId: string;
                recipientId: string | null;
            }) | null;
            unreadCount: number;
            totalMessages: number;
        }[];
        meta: {
            page: number;
            limit: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
}
//# sourceMappingURL=messaging.d.ts.map