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
exports.EventsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EventsService {
    static async createEvent(eventData) {
        try {
            console.log(`📅 Creating event: ${eventData.title}`);
            let imageUrl;
            if (eventData.imageFile && eventData.creatorId) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadResult = await FileUploadService.uploadFile(eventData.imageFile, FileType.EVENT_IMAGE, eventData.creatorId);
                imageUrl = uploadResult.url;
            }
            const event = await prisma.event.create({
                data: {
                    title: eventData.title,
                    description: eventData.description,
                    type: eventData.type,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                    location: eventData.location,
                    isOnline: eventData.isOnline || false,
                    meetingUrl: eventData.meetingUrl,
                    maxAttendees: eventData.maxAttendees,
                    price: eventData.price,
                    organizer: eventData.organizer,
                    organizerContact: eventData.organizerContact,
                    imageUrl,
                },
                include: {
                    registrations: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            });
            console.log(`✅ Event created: ${event.id}`);
            return event;
        }
        catch (error) {
            console.error('❌ Create event error:', error);
            throw error;
        }
    }
    static async getEvents(filters, pagination) {
        try {
            console.log('📋 Getting events with filters:', filters);
            const where = {
                status: client_1.EventStatus.UPCOMING,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.isOnline !== undefined) {
                where.isOnline = filters.isOnline;
            }
            if (filters.location) {
                where.location = { contains: filters.location };
            }
            if (filters.organizer) {
                where.organizer = { contains: filters.organizer };
            }
            if (filters.upcoming) {
                where.startDate = { gte: new Date() };
            }
            if (filters.search) {
                where.OR = [
                    { title: { contains: filters.search } },
                    { description: { contains: filters.search } },
                    { location: { contains: filters.search } },
                    { organizer: { contains: filters.search } },
                ];
            }
            const total = await prisma.event.count({ where });
            const events = await prisma.event.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
                orderBy: {
                    [pagination.sortBy || 'startDate']: pagination.sortOrder || 'asc',
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                events,
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
            console.error('❌ Get events error:', error);
            throw error;
        }
    }
    static async getEventById(eventId, userId) {
        try {
            console.log(`📄 Getting event ${eventId}`);
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    registrations: userId ? {
                        where: { userId },
                    } : {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                    profileType: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            });
            if (!event) {
                throw new Error('Événement non trouvé');
            }
            return event;
        }
        catch (error) {
            console.error('❌ Get event by ID error:', error);
            throw error;
        }
    }
    static async updateEvent(eventId, organizerName, updateData) {
        try {
            console.log(`📅 Updating event ${eventId}`);
            const existingEvent = await prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!existingEvent) {
                throw new Error('Événement non trouvé');
            }
            if (existingEvent.organizer !== organizerName) {
                throw new Error('Non autorisé à modifier cet événement');
            }
            let imageUrl = existingEvent.imageUrl;
            if (updateData.imageFile && updateData.creatorId) {
                const { FileUploadService, FileType } = await Promise.resolve().then(() => __importStar(require('./file-upload')));
                const uploadResult = await FileUploadService.uploadFile(updateData.imageFile, FileType.EVENT_IMAGE, updateData.creatorId);
                imageUrl = uploadResult.url;
                if (existingEvent.imageUrl) {
                    const publicId = existingEvent.imageUrl.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        await FileUploadService.deleteFile(publicId);
                    }
                }
            }
            const event = await prisma.event.update({
                where: { id: eventId },
                data: {
                    title: updateData.title,
                    description: updateData.description,
                    type: updateData.type,
                    startDate: updateData.startDate,
                    endDate: updateData.endDate,
                    location: updateData.location,
                    isOnline: updateData.isOnline,
                    meetingUrl: updateData.meetingUrl,
                    maxAttendees: updateData.maxAttendees,
                    price: updateData.price,
                    organizer: updateData.organizer,
                    organizerContact: updateData.organizerContact,
                    imageUrl,
                },
                include: {
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            });
            console.log(`✅ Event updated: ${event.id}`);
            return event;
        }
        catch (error) {
            console.error('❌ Update event error:', error);
            throw error;
        }
    }
    static async deleteEvent(eventId, organizerName) {
        try {
            console.log(`🗑️ Deleting event ${eventId}`);
            const existingEvent = await prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!existingEvent) {
                throw new Error('Événement non trouvé');
            }
            if (existingEvent.organizer !== organizerName) {
                throw new Error('Non autorisé à supprimer cet événement');
            }
            await prisma.event.delete({
                where: { id: eventId },
            });
            console.log(`✅ Event deleted: ${eventId}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Delete event error:', error);
            throw error;
        }
    }
    static async registerForEvent(eventId, userId) {
        try {
            console.log(`📝 Registering user ${userId} for event ${eventId}`);
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            });
            if (!event) {
                throw new Error('Événement non trouvé');
            }
            if (event.status !== client_1.EventStatus.UPCOMING) {
                throw new Error('Les inscriptions pour cet événement ne sont pas ouvertes');
            }
            if (event.startDate < new Date()) {
                throw new Error('Impossible de s\'inscrire à un événement passé');
            }
            if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
                throw new Error('L\'événement est complet');
            }
            const existingRegistration = await prisma.eventRegistration.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });
            if (existingRegistration) {
                throw new Error('Vous êtes déjà inscrit à cet événement');
            }
            const registration = await prisma.eventRegistration.create({
                data: {
                    eventId,
                    userId,
                },
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
                    event: {
                        select: {
                            id: true,
                            title: true,
                            startDate: true,
                            organizer: true,
                        },
                    },
                },
            });
            console.log(`✅ Registration created: ${registration.id}`);
            try {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true }
                });
                if (user) {
                    console.log(`📝 TODO: Créer notification pour organisateur "${event.organizer}" - besoin de l'ID utilisateur`);
                }
            }
            catch (notificationError) {
                console.error('❌ Failed to create event registration notification:', notificationError);
            }
            return registration;
        }
        catch (error) {
            console.error('❌ Register for event error:', error);
            throw error;
        }
    }
    static async unregisterFromEvent(eventId, userId) {
        try {
            console.log(`❌ Unregistering user ${userId} from event ${eventId}`);
            const registration = await prisma.eventRegistration.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });
            if (!registration) {
                throw new Error('Inscription non trouvée');
            }
            await prisma.eventRegistration.delete({
                where: { id: registration.id },
            });
            console.log(`✅ Registration deleted: ${registration.id}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Unregister from event error:', error);
            throw error;
        }
    }
    static async getEventRegistrations(eventId, organizerName, pagination) {
        try {
            console.log(`📋 Getting registrations for event ${eventId}`);
            const event = await prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                throw new Error('Événement non trouvé');
            }
            if (event.organizer !== organizerName) {
                throw new Error('Non autorisé à voir les inscriptions');
            }
            const total = await prisma.eventRegistration.count({
                where: { eventId },
            });
            const registrations = await prisma.eventRegistration.findMany({
                where: { eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileType: true,
                            avatar: true,
                            company: true,
                            location: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                registrations,
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
            console.error('❌ Get event registrations error:', error);
            throw error;
        }
    }
    static async getUserRegistrations(userId, pagination) {
        try {
            console.log(`📋 Getting registrations for user ${userId}`);
            const total = await prisma.eventRegistration.count({
                where: { userId },
            });
            const registrations = await prisma.eventRegistration.findMany({
                where: { userId },
                include: {
                    event: true,
                },
                orderBy: { event: { startDate: 'asc' } },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                registrations: registrations.map(r => r.event),
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
            console.error('❌ Get user registrations error:', error);
            throw error;
        }
    }
    static async getEventsByOrganizer(organizerName, pagination) {
        try {
            console.log(`📅 Getting events by organizer: ${organizerName}`);
            const total = await prisma.event.count({
                where: { organizer: { contains: organizerName } },
            });
            const events = await prisma.event.findMany({
                where: { organizer: { contains: organizerName } },
                include: {
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                events,
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
            console.error('❌ Get events by organizer error:', error);
            throw error;
        }
    }
}
exports.EventsService = EventsService;
