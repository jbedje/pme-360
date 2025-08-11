import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const phoneSchema: z.ZodOptional<z.ZodString>;
export declare const urlSchema: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
export declare const uuidSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    profileType: z.ZodEnum<{
        STARTUP: "STARTUP";
        EXPERT: "EXPERT";
        MENTOR: "MENTOR";
        INCUBATOR: "INCUBATOR";
        INVESTOR: "INVESTOR";
        FINANCIAL_INSTITUTION: "FINANCIAL_INSTITUTION";
        PUBLIC_ORGANIZATION: "PUBLIC_ORGANIZATION";
        TECH_PARTNER: "TECH_PARTNER";
        PME: "PME";
        CONSULTANT: "CONSULTANT";
        ADMIN: "ADMIN";
    }>;
    company: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    linkedin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const sendMessageSchema: z.ZodObject<{
    recipientId: z.ZodString;
    subject: z.ZodString;
    content: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<{
        MESSAGE: "MESSAGE";
        SYSTEM: "SYSTEM";
        INVITATION: "INVITATION";
    }>>;
    parentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createOpportunitySchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        FUNDING: "FUNDING";
        TALENT: "TALENT";
        SERVICE: "SERVICE";
        PARTNERSHIP: "PARTNERSHIP";
    }>;
    budget: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    remote: z.ZodDefault<z.ZodBoolean>;
    deadline: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    experience: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const applyToOpportunitySchema: z.ZodObject<{
    coverLetter: z.ZodString;
    portfolio: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    expectedBudget: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createResourceSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    type: z.ZodEnum<{
        WEBINAR: "WEBINAR";
        ARTICLE: "ARTICLE";
        VIDEO: "VIDEO";
        TOOL: "TOOL";
        TEMPLATE: "TEMPLATE";
        GUIDE: "GUIDE";
    }>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPremium: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createEventSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        CONFERENCE: "CONFERENCE";
        WORKSHOP: "WORKSHOP";
        NETWORKING: "NETWORKING";
        WEBINAR: "WEBINAR";
        MEETUP: "MEETUP";
    }>;
    startDate: z.ZodCoercedDate<unknown>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    location: z.ZodOptional<z.ZodString>;
    isOnline: z.ZodDefault<z.ZodBoolean>;
    meetingUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    maxAttendees: z.ZodOptional<z.ZodNumber>;
    price: z.ZodOptional<z.ZodString>;
    organizerContact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<{
        MESSAGE: "MESSAGE";
        CONNECTION_REQUEST: "CONNECTION_REQUEST";
        OPPORTUNITY_MATCH: "OPPORTUNITY_MATCH";
        APPLICATION_UPDATE: "APPLICATION_UPDATE";
        EVENT_REMINDER: "EVENT_REMINDER";
        SYSTEM: "SYSTEM";
    }>;
    title: z.ZodString;
    message: z.ZodString;
    actionUrl: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const userFiltersSchema: z.ZodObject<{
    profileType: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    verified: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const opportunityFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    remote: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    budgetMin: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    budgetMax: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const eventFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    isOnline: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    location: z.ZodOptional<z.ZodString>;
    upcoming: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    organizer: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const resourceFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    isPremium: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const messageFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    conversationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const notificationFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    read: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const analyticsUserMetricsSchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<{
        week: "week";
        month: "month";
        year: "year";
    }>>;
}, z.core.$strip>;
export declare const analyticsTrendsSchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const fileUploadSchema: z.ZodObject<{
    fileType: z.ZodEnum<{
        avatar: "avatar";
        resource_thumbnail: "resource_thumbnail";
        message_attachment: "message_attachment";
        application_document: "application_document";
        event_image: "event_image";
        company_logo: "company_logo";
    }>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const userIdParamSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const opportunityIdParamSchema: z.ZodObject<{
    opportunityId: z.ZodString;
}, z.core.$strip>;
export declare const eventIdParamSchema: z.ZodObject<{
    eventId: z.ZodString;
}, z.core.$strip>;
export declare const resourceIdParamSchema: z.ZodObject<{
    resourceId: z.ZodString;
}, z.core.$strip>;
export declare const messageIdParamSchema: z.ZodObject<{
    messageId: z.ZodString;
}, z.core.$strip>;
export declare const notificationIdParamSchema: z.ZodObject<{
    notificationId: z.ZodString;
}, z.core.$strip>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type CreateOpportunityData = z.infer<typeof createOpportunitySchema>;
export type ApplyToOpportunityData = z.infer<typeof applyToOpportunitySchema>;
export type CreateResourceData = z.infer<typeof createResourceSchema>;
export type CreateEventData = z.infer<typeof createEventSchema>;
export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type UserFiltersData = z.infer<typeof userFiltersSchema>;
export type OpportunityFiltersData = z.infer<typeof opportunityFiltersSchema>;
export type EventFiltersData = z.infer<typeof eventFiltersSchema>;
export type ResourceFiltersData = z.infer<typeof resourceFiltersSchema>;
export type MessageFiltersData = z.infer<typeof messageFiltersSchema>;
export type NotificationFiltersData = z.infer<typeof notificationFiltersSchema>;
//# sourceMappingURL=schemas.d.ts.map