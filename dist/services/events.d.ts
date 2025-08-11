import { EventType } from '@prisma/client';
export interface CreateEventData {
    title: string;
    description: string;
    type: EventType;
    startDate: Date;
    endDate?: Date;
    location?: string;
    isOnline?: boolean;
    meetingUrl?: string;
    maxAttendees?: number;
    price?: string;
    organizer: string;
    organizerContact?: string;
    imageFile?: Express.Multer.File;
    creatorId?: string;
}
export interface EventFilters {
    type?: string;
    status?: string;
    isOnline?: boolean;
    location?: string;
    upcoming?: boolean;
    search?: string;
    organizer?: string;
}
export interface EventPagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class EventsService {
    static createEvent(eventData: CreateEventData): Promise<{
        _count: {
            registrations: number;
        };
        registrations: ({
            user: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            eventId: string;
        })[];
    } & {
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.EventStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        startDate: Date;
        endDate: Date | null;
        isOnline: boolean;
        meetingUrl: string | null;
        maxAttendees: number | null;
        price: string | null;
        organizer: string;
        organizerContact: string | null;
        imageUrl: string | null;
    }>;
    static getEvents(filters: EventFilters, pagination: EventPagination): Promise<{
        events: ({
            _count: {
                registrations: number;
            };
        } & {
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            startDate: Date;
            endDate: Date | null;
            isOnline: boolean;
            meetingUrl: string | null;
            maxAttendees: number | null;
            price: string | null;
            organizer: string;
            organizerContact: string | null;
            imageUrl: string | null;
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
    static getEventById(eventId: string, userId?: string): Promise<{
        _count: {
            registrations: number;
        };
        registrations: ({
            id: string;
            createdAt: Date;
            userId: string;
            eventId: string;
        } | ({
            user: {
                name: string;
                id: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            eventId: string;
        }))[];
    } & {
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.EventStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        startDate: Date;
        endDate: Date | null;
        isOnline: boolean;
        meetingUrl: string | null;
        maxAttendees: number | null;
        price: string | null;
        organizer: string;
        organizerContact: string | null;
        imageUrl: string | null;
    }>;
    static updateEvent(eventId: string, organizerName: string, updateData: Partial<CreateEventData>): Promise<{
        _count: {
            registrations: number;
        };
    } & {
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.EventStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        startDate: Date;
        endDate: Date | null;
        isOnline: boolean;
        meetingUrl: string | null;
        maxAttendees: number | null;
        price: string | null;
        organizer: string;
        organizerContact: string | null;
        imageUrl: string | null;
    }>;
    static deleteEvent(eventId: string, organizerName: string): Promise<{
        success: boolean;
    }>;
    static registerForEvent(eventId: string, userId: string): Promise<{
        event: {
            id: string;
            title: string;
            startDate: Date;
            organizer: string;
        };
        user: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        eventId: string;
    }>;
    static unregisterFromEvent(eventId: string, userId: string): Promise<{
        success: boolean;
    }>;
    static getEventRegistrations(eventId: string, organizerName: string, pagination: EventPagination): Promise<{
        registrations: ({
            user: {
                name: string;
                id: string;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                company: string | null;
                location: string | null;
                avatar: string | null;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            eventId: string;
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
    static getUserRegistrations(userId: string, pagination: EventPagination): Promise<{
        registrations: {
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            startDate: Date;
            endDate: Date | null;
            isOnline: boolean;
            meetingUrl: string | null;
            maxAttendees: number | null;
            price: string | null;
            organizer: string;
            organizerContact: string | null;
            imageUrl: string | null;
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
    static getEventsByOrganizer(organizerName: string, pagination: EventPagination): Promise<{
        events: ({
            _count: {
                registrations: number;
            };
        } & {
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            startDate: Date;
            endDate: Date | null;
            isOnline: boolean;
            meetingUrl: string | null;
            maxAttendees: number | null;
            price: string | null;
            organizer: string;
            organizerContact: string | null;
            imageUrl: string | null;
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
}
//# sourceMappingURL=events.d.ts.map