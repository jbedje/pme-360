import { MessageType } from '@prisma/client';
export interface SendMessageData {
    recipientId: string;
    content: string;
    type?: MessageType;
}
export interface MessageFilters {
    type?: string;
    search?: string;
    conversationId?: string;
}
export interface MessagePagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class SimpleMessagingService {
    static sendMessage(senderId: string, messageData: SendMessageData): Promise<{
        conversation: {
            id: string;
            title: string | null;
        };
        attachments: {
            size: number | null;
            id: string;
            url: string;
            messageId: string;
            filename: string;
            mimeType: string | null;
        }[];
        sender: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            avatar: string | null;
        };
        recipient: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            avatar: string | null;
        } | null;
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
    }>;
    static getMessages(userId: string, filters: MessageFilters, pagination: MessagePagination, type?: 'received' | 'sent'): Promise<{
        messages: ({
            conversation: {
                id: string;
                title: string | null;
            };
            attachments: {
                size: number | null;
                id: string;
                url: string;
                messageId: string;
                filename: string;
                mimeType: string | null;
            }[];
            sender: {
                name: string;
                id: string;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                avatar: string | null;
            };
            recipient: {
                name: string;
                id: string;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                avatar: string | null;
            } | null;
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
        })[];
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
        conversation: {
            id: string;
            title: string | null;
        };
        attachments: {
            size: number | null;
            id: string;
            url: string;
            messageId: string;
            filename: string;
            mimeType: string | null;
        }[];
        sender: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            avatar: string | null;
        };
        recipient: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            avatar: string | null;
        } | null;
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
                avatar: string | null;
            } | null;
            lastMessage: {
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
            };
            unreadCount: number;
            totalMessages: number;
            messages: ({
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
            })[];
            _count: {
                messages: number;
            };
            participants: ({
                user: {
                    name: string;
                    id: string;
                    email: string;
                    profileType: import(".prisma/client").$Enums.ProfileType;
                    avatar: string | null;
                };
            } & {
                id: string;
                userId: string;
                joinedAt: Date;
                leftAt: Date | null;
                conversationId: string;
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string | null;
            isGroup: boolean;
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
//# sourceMappingURL=simple-messaging.d.ts.map