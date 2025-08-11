"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdParamSchema = exports.messageIdParamSchema = exports.resourceIdParamSchema = exports.eventIdParamSchema = exports.opportunityIdParamSchema = exports.userIdParamSchema = exports.idParamSchema = exports.fileUploadSchema = exports.analyticsTrendsSchema = exports.analyticsUserMetricsSchema = exports.notificationFiltersSchema = exports.messageFiltersSchema = exports.resourceFiltersSchema = exports.eventFiltersSchema = exports.opportunityFiltersSchema = exports.userFiltersSchema = exports.paginationSchema = exports.createNotificationSchema = exports.createEventSchema = exports.createResourceSchema = exports.applyToOpportunitySchema = exports.createOpportunitySchema = exports.sendMessageSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = exports.uuidSchema = exports.urlSchema = exports.phoneSchema = exports.nameSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().email('Email invalide').max(255);
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
exports.nameSchema = zod_1.z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides');
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)\.]{8,20}$/, 'Numéro de téléphone invalide')
    .optional();
exports.urlSchema = zod_1.z
    .string()
    .url('URL invalide')
    .optional()
    .or(zod_1.z.literal(''));
exports.uuidSchema = zod_1.z.string().uuid('ID invalide');
exports.registerSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    name: exports.nameSchema,
    profileType: zod_1.z.enum(['STARTUP', 'EXPERT', 'MENTOR', 'INCUBATOR', 'INVESTOR', 'FINANCIAL_INSTITUTION', 'PUBLIC_ORGANIZATION', 'TECH_PARTNER', 'PME', 'CONSULTANT', 'ADMIN']),
    company: zod_1.z.string().max(200).optional(),
    location: zod_1.z.string().max(200).optional(),
    phone: exports.phoneSchema,
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Mot de passe requis'),
});
exports.updateUserSchema = zod_1.z.object({
    name: exports.nameSchema.optional(),
    company: zod_1.z.string().max(200).optional(),
    location: zod_1.z.string().max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    website: exports.urlSchema,
    linkedin: exports.urlSchema,
    phone: exports.phoneSchema,
});
exports.sendMessageSchema = zod_1.z.object({
    recipientId: exports.uuidSchema,
    subject: zod_1.z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
    content: zod_1.z.string().min(1, 'Contenu requis').max(5000, 'Message trop long'),
    type: zod_1.z.enum(['MESSAGE', 'INVITATION', 'SYSTEM']).optional(),
    parentId: exports.uuidSchema.optional(),
});
exports.createOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Titre trop court').max(200, 'Titre trop long'),
    description: zod_1.z.string().min(20, 'Description trop courte').max(2000, 'Description trop longue'),
    type: zod_1.z.enum(['FUNDING', 'TALENT', 'SERVICE', 'PARTNERSHIP']),
    budget: zod_1.z.string().max(100).optional(),
    amount: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(200).optional(),
    remote: zod_1.z.boolean().default(false),
    deadline: zod_1.z.coerce.date().optional(),
    startDate: zod_1.z.coerce.date().optional(),
    experience: zod_1.z.string().max(500).optional(),
    requirements: zod_1.z.array(zod_1.z.string().max(100)).max(20).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
});
exports.applyToOpportunitySchema = zod_1.z.object({
    coverLetter: zod_1.z.string().min(50, 'Lettre de motivation trop courte').max(2000, 'Lettre de motivation trop longue'),
    portfolio: exports.urlSchema,
    expectedBudget: zod_1.z.string().max(100).optional(),
});
exports.createResourceSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Titre trop court').max(200, 'Titre trop long'),
    description: zod_1.z.string().min(20, 'Description trop courte').max(1000, 'Description trop longue'),
    content: zod_1.z.string().max(10000).optional(),
    url: exports.urlSchema,
    type: zod_1.z.enum(['GUIDE', 'TEMPLATE', 'TOOL', 'ARTICLE', 'VIDEO', 'WEBINAR']),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    isPremium: zod_1.z.boolean().default(false),
});
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Titre trop court').max(200, 'Titre trop long'),
    description: zod_1.z.string().min(20, 'Description trop courte').max(2000, 'Description trop longue'),
    type: zod_1.z.enum(['CONFERENCE', 'WORKSHOP', 'NETWORKING', 'WEBINAR', 'MEETUP']),
    startDate: zod_1.z.coerce.date().refine(date => date > new Date(), 'La date de début doit être dans le futur'),
    endDate: zod_1.z.coerce.date().optional(),
    location: zod_1.z.string().max(200).optional(),
    isOnline: zod_1.z.boolean().default(false),
    meetingUrl: exports.urlSchema,
    maxAttendees: zod_1.z.number().min(1).max(10000).optional(),
    price: zod_1.z.string().max(50).optional(),
    organizerContact: zod_1.z.string().max(200).optional(),
}).refine(data => {
    if (data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
}, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate']
}).refine(data => {
    if (data.isOnline && !data.meetingUrl) {
        return false;
    }
    return true;
}, {
    message: 'URL de réunion requise pour les événements en ligne',
    path: ['meetingUrl']
});
exports.createNotificationSchema = zod_1.z.object({
    userId: exports.uuidSchema,
    type: zod_1.z.enum(['MESSAGE', 'CONNECTION_REQUEST', 'OPPORTUNITY_MATCH', 'APPLICATION_UPDATE', 'EVENT_REMINDER', 'SYSTEM']),
    title: zod_1.z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
    message: zod_1.z.string().min(1, 'Message requis').max(500, 'Message trop long'),
    actionUrl: zod_1.z.string().max(500).optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    sortBy: zod_1.z.string().max(50).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.userFiltersSchema = zod_1.z.object({
    profileType: zod_1.z.string().max(50).optional(),
    location: zod_1.z.string().max(200).optional(),
    verified: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(200).optional(),
});
exports.opportunityFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().max(50).optional(),
    status: zod_1.z.string().max(50).optional(),
    location: zod_1.z.string().max(200).optional(),
    remote: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(200).optional(),
    tags: zod_1.z.string().max(200).optional(),
    budgetMin: zod_1.z.coerce.number().min(0).optional(),
    budgetMax: zod_1.z.coerce.number().min(0).optional(),
});
exports.eventFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().max(50).optional(),
    status: zod_1.z.string().max(50).optional(),
    isOnline: zod_1.z.coerce.boolean().optional(),
    location: zod_1.z.string().max(200).optional(),
    upcoming: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(200).optional(),
    organizer: zod_1.z.string().max(200).optional(),
});
exports.resourceFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().max(50).optional(),
    author: zod_1.z.string().max(200).optional(),
    search: zod_1.z.string().max(200).optional(),
    tags: zod_1.z.string().max(200).optional(),
    isPremium: zod_1.z.coerce.boolean().optional(),
});
exports.messageFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().max(50).optional(),
    status: zod_1.z.string().max(50).optional(),
    search: zod_1.z.string().max(200).optional(),
    conversationId: exports.uuidSchema.optional(),
});
exports.notificationFiltersSchema = zod_1.z.object({
    type: zod_1.z.string().max(50).optional(),
    read: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(200).optional(),
});
exports.analyticsUserMetricsSchema = zod_1.z.object({
    period: zod_1.z.enum(['week', 'month', 'year']).default('month'),
});
exports.analyticsTrendsSchema = zod_1.z.object({
    days: zod_1.z.coerce.number().min(1).max(365).default(30),
});
exports.fileUploadSchema = zod_1.z.object({
    fileType: zod_1.z.enum(['avatar', 'resource_thumbnail', 'message_attachment', 'event_image', 'application_document', 'company_logo']),
});
exports.idParamSchema = zod_1.z.object({
    id: exports.uuidSchema,
});
exports.userIdParamSchema = zod_1.z.object({
    userId: exports.uuidSchema,
});
exports.opportunityIdParamSchema = zod_1.z.object({
    opportunityId: exports.uuidSchema,
});
exports.eventIdParamSchema = zod_1.z.object({
    eventId: exports.uuidSchema,
});
exports.resourceIdParamSchema = zod_1.z.object({
    resourceId: exports.uuidSchema,
});
exports.messageIdParamSchema = zod_1.z.object({
    messageId: exports.uuidSchema,
});
exports.notificationIdParamSchema = zod_1.z.object({
    notificationId: exports.uuidSchema,
});
