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
exports.MessagingService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
class MessagingService {
    static async sendMessage(senderId, messageData) {
        try {
            logger_1.logger.debug(`📤 Sending message from ${senderId} to ${messageData.recipientId}`);
            const recipient = await prisma.user.findUnique({
                where: { id: messageData.recipientId },
            });
            if (!recipient) {
                throw new Error('Destinataire introuvable');
            }
            if (messageData.parentId) {
                const parentMessage = await prisma.message.findUnique({
                    where: { id: messageData.parentId },
                });
                if (!parentMessage) {
                    throw new Error('Message parent introuvable');
                }
            }
            let attachmentUrls = [];
            if (messageData.attachmentFiles && messageData.attachmentFiles.length > 0) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadPromises = messageData.attachmentFiles.map(file => FileUploadService.uploadFile(file, FileType.MESSAGE_ATTACHMENT, senderId));
                const uploadResults = await Promise.all(uploadPromises);
                attachmentUrls = uploadResults.map(result => result.url);
            }
            const message = await prisma.message.create({
                data: {
                    senderId,
                    recipientId: messageData.recipientId,
                    subject: messageData.subject,
                    content: messageData.content,
                    type: messageData.type || client_1.MessageType.MESSAGE,
                    parentId: messageData.parentId,
                    status: client_1.MessageStatus.SENT,
                    attachments: attachmentUrls.length > 0 ? {
                        create: attachmentUrls.map(url => ({
                            url,
                            filename: 'attachment',
                            fileType: 'unknown',
                            fileSize: 0,
                        }))
                    } : undefined,
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
                    parent: {
                        select: {
                            id: true,
                            subject: true,
                            sender: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    attachments: true,
                },
            });
            logger_1.logger.info(`✅ Message sent: ${message.id}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error('❌ Send message error:', error);
            throw error;
        }
    }
    static async getMessages(userId, filters, pagination, type = 'received') {
        try {
            logger_1.logger.debug(`📥 Getting ${type} messages for user ${userId}`);
            const where = {
                [type === 'received' ? 'recipientId' : 'senderId']: userId,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.search) {
                where.OR = [
                    { subject: { contains: filters.search } },
                    { content: { contains: filters.content } },
                    {
                        [type === 'received' ? 'sender' : 'recipient']: {
                            name: { contains: filters.search },
                        },
                    },
                ];
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
                    parent: {
                        select: {
                            id: true,
                            subject: true,
                            sender: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    attachments: true,
                    _count: {
                        select: {
                            replies: true,
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
            logger_1.logger.error('❌ Get messages error:', error);
            throw error;
        }
    }
    static async getMessageById(messageId, userId) {
        try {
            logger_1.logger.debug(`📨 Getting message ${messageId} for user ${userId}`);
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
                    parent: {
                        select: {
                            id: true,
                            subject: true,
                            content: true,
                            sender: {
                                select: {
                                    name: true,
                                    avatar: true,
                                },
                            },
                            createdAt: true,
                        },
                    },
                    replies: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                    attachments: true,
                },
            });
            if (!message) {
                throw new Error('Message non trouvé');
            }
            if (message.recipientId === userId && message.status === client_1.MessageStatus.SENT) {
                await prisma.message.update({
                    where: { id: messageId },
                    data: {
                        status: client_1.MessageStatus.READ,
                        readAt: new Date(),
                    },
                });
                message.status = client_1.MessageStatus.READ;
                message.readAt = new Date();
            }
            return message;
        }
        catch (error) {
            logger_1.logger.error('❌ Get message by ID error:', error);
            throw error;
        }
    }
    static async markAsRead(messageId, userId) {
        try {
            logger_1.logger.debug(`✅ Marking message ${messageId} as read for user ${userId}`);
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
                data: {
                    status: client_1.MessageStatus.READ,
                    readAt: new Date(),
                },
            });
            return updatedMessage;
        }
        catch (error) {
            logger_1.logger.error('❌ Mark message as read error:', error);
            throw error;
        }
    }
    static async deleteMessage(messageId, userId) {
        try {
            logger_1.logger.debug(`🗑️ Deleting message ${messageId} for user ${userId}`);
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
            logger_1.logger.info(`✅ Message deleted: ${messageId}`);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('❌ Delete message error:', error);
            throw error;
        }
    }
    static async getConversations(userId, pagination) {
        try {
            logger_1.logger.debug(`💬 Getting conversations for user ${userId}`);
            const conversations = await prisma.$queryRaw `
        SELECT DISTINCT
          CASE 
            WHEN senderId = ${userId} THEN recipientId 
            ELSE senderId 
          END as otherUserId,
          MAX(createdAt) as lastMessageDate,
          COUNT(*) as messageCount
        FROM Message 
        WHERE senderId = ${userId} OR recipientId = ${userId}
        GROUP BY otherUserId
        ORDER BY lastMessageDate DESC
        LIMIT ${pagination.limit}
        OFFSET ${(pagination.page - 1) * pagination.limit}
      `;
            const conversationDetails = await Promise.all(conversations.map(async (conv) => {
                const otherUser = await prisma.user.findUnique({
                    where: { id: conv.otherUserId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileType: true,
                        avatar: true,
                        status: true,
                    },
                });
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, recipientId: conv.otherUserId },
                            { senderId: conv.otherUserId, recipientId: userId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: {
                            select: { name: true },
                        },
                    },
                });
                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: conv.otherUserId,
                        recipientId: userId,
                        status: client_1.MessageStatus.SENT,
                    },
                });
                return {
                    otherUser,
                    lastMessage,
                    unreadCount,
                    totalMessages: conv.messageCount,
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
            logger_1.logger.error('❌ Get conversations error:', error);
            throw error;
        }
    }
    static async getUnreadCount(userId) {
        try {
            const count = await prisma.message.count({
                where: {
                    recipientId: userId,
                    status: client_1.MessageStatus.SENT,
                },
            });
            return { unreadCount: count };
        }
        catch (error) {
            logger_1.logger.error('❌ Get unread count error:', error);
            throw error;
        }
    }
}
exports.MessagingService = MessagingService;
