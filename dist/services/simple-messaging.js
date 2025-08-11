"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleMessagingService = void 0;
const client_1 = require("@prisma/client");
const notifications_1 = require("./notifications");
const prisma = new client_1.PrismaClient();
class SimpleMessagingService {
    static async sendMessage(senderId, messageData) {
        try {
            console.log(`📤 Sending message from ${senderId} to ${messageData.recipientId}`);
            const recipient = await prisma.user.findUnique({
                where: { id: messageData.recipientId },
            });
            if (!recipient) {
                throw new Error('Destinataire introuvable');
            }
            let conversation = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        {
                            participants: {
                                some: { userId: senderId },
                            },
                        },
                        {
                            participants: {
                                some: { userId: messageData.recipientId },
                            },
                        },
                        { isGroup: false },
                    ],
                },
            });
            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        isGroup: false,
                        participants: {
                            create: [
                                { userId: senderId },
                                { userId: messageData.recipientId },
                            ],
                        },
                    },
                });
            }
            const message = await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId,
                    recipientId: messageData.recipientId,
                    content: messageData.content,
                    type: messageData.type || client_1.MessageType.TEXT,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    conversation: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    attachments: true,
                },
            });
            console.log(`✅ Message sent: ${message.id}`);
            try {
                const sender = await prisma.user.findUnique({
                    where: { id: senderId },
                    select: { name: true }
                });
                if (sender) {
                    const messagePreview = messageData.content.length > 50
                        ? messageData.content.substring(0, 50) + '...'
                        : messageData.content;
                    await notifications_1.NotificationsService.createMessageNotification(messageData.recipientId, sender.name, messagePreview);
                }
            }
            catch (notificationError) {
                console.error('❌ Failed to create message notification:', notificationError);
            }
            return message;
        }
        catch (error) {
            console.error('❌ Send message error:', error);
            throw error;
        }
    }
    static async getMessages(userId, filters, pagination, type = 'received') {
        try {
            console.log(`📥 Getting ${type} messages for user ${userId}`);
            const where = {
                [type === 'received' ? 'recipientId' : 'senderId']: userId,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.conversationId) {
                where.conversationId = filters.conversationId;
            }
            if (filters.search) {
                where.content = { contains: filters.search };
            }
            const total = await prisma.message.count({ where });
            const messages = await prisma.message.findMany({
                where,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    conversation: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    attachments: true,
                },
                orderBy: {
                    [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                messages,
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
            console.error('❌ Get messages error:', error);
            throw error;
        }
    }
    static async getMessageById(messageId, userId) {
        try {
            console.log(`📨 Getting message ${messageId} for user ${userId}`);
            const message = await prisma.message.findFirst({
                where: {
                    id: messageId,
                    OR: [
                        { senderId: userId },
                        { recipientId: userId },
                    ],
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                        },
                    },
                    conversation: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    attachments: true,
                },
            });
            if (!message) {
                throw new Error('Message non trouvé');
            }
            if (message.recipientId === userId && !message.readAt) {
                await prisma.message.update({
                    where: { id: messageId },
                    data: { readAt: new Date() },
                });
                message.readAt = new Date();
            }
            return message;
        }
        catch (error) {
            console.error('❌ Get message by ID error:', error);
            throw error;
        }
    }
    static async markAsRead(messageId, userId) {
        try {
            console.log(`✅ Marking message ${messageId} as read for user ${userId}`);
            const message = await prisma.message.findFirst({
                where: {
                    id: messageId,
                    recipientId: userId,
                },
            });
            if (!message) {
                throw new Error('Message non trouvé');
            }
            const updatedMessage = await prisma.message.update({
                where: { id: messageId },
                data: { readAt: new Date() },
            });
            return updatedMessage;
        }
        catch (error) {
            console.error('❌ Mark message as read error:', error);
            throw error;
        }
    }
    static async deleteMessage(messageId, userId) {
        try {
            console.log(`🗑️ Deleting message ${messageId} for user ${userId}`);
            const message = await prisma.message.findFirst({
                where: {
                    id: messageId,
                    OR: [
                        { senderId: userId },
                        { recipientId: userId },
                    ],
                },
            });
            if (!message) {
                throw new Error('Message non trouvé');
            }
            await prisma.message.delete({
                where: { id: messageId },
            });
            console.log(`✅ Message deleted: ${messageId}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Delete message error:', error);
            throw error;
        }
    }
    static async getConversations(userId, pagination) {
        try {
            console.log(`💬 Getting conversations for user ${userId}`);
            const conversations = await prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { userId: userId },
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profileType: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: {
                            sender: {
                                select: { name: true },
                            },
                        },
                    },
                    _count: {
                        select: { messages: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            const conversationDetails = await Promise.all(conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        recipientId: userId,
                        readAt: null,
                    },
                });
                const otherParticipant = conv.participants.find(p => p.userId !== userId);
                return {
                    ...conv,
                    otherUser: otherParticipant?.user || null,
                    lastMessage: conv.messages[0] || null,
                    unreadCount,
                    totalMessages: conv._count.messages,
                };
            }));
            return {
                conversations: conversationDetails,
                meta: {
                    page: pagination.page,
                    limit: pagination.limit,
                    hasNext: conversations.length === pagination.limit,
                    hasPrev: pagination.page > 1,
                },
            };
        }
        catch (error) {
            console.error('❌ Get conversations error:', error);
            throw error;
        }
    }
    static async getUnreadCount(userId) {
        try {
            const count = await prisma.message.count({
                where: {
                    recipientId: userId,
                    readAt: null,
                },
            });
            return { unreadCount: count };
        }
        catch (error) {
            console.error('❌ Get unread count error:', error);
            throw error;
        }
    }
}
exports.SimpleMessagingService = SimpleMessagingService;
