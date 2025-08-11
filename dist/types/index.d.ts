import { Request } from 'express';
import { ProfileType, UserStatus } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        profileType: ProfileType;
        verified: boolean;
    };
}
export interface UserCreateData {
    name: string;
    email: string;
    password: string;
    profileType: ProfileType;
    company?: string;
    location?: string;
}
export interface UserUpdateData {
    name?: string;
    company?: string;
    location?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    phone?: string;
}
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    profileType: ProfileType;
    status: UserStatus;
    company?: string | null;
    location?: string | null;
    avatar?: string | null;
    description?: string | null;
    website?: string | null;
    linkedin?: string | null;
    phone?: string | null;
    verified: boolean;
    completionScore: number;
    rating?: number | null;
    reviewCount: number;
    expertises: Array<{
        id: string;
        name: string;
        level: number;
        verified: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date | null;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    profileType: ProfileType;
    company?: string;
    location?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: 'Bearer';
}
export interface AuthResponse {
    user: UserProfile;
    tokens: AuthTokens;
}
export interface JWTPayload {
    userId: string;
    email: string;
    profileType: ProfileType;
    verified: boolean;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface SearchFilters {
    profileType?: ProfileType;
    location?: string;
    skills?: string[];
    verified?: boolean;
    search?: string;
}
export interface SearchParams extends PaginationParams {
    filters?: SearchFilters;
}
export interface OpportunityFilters {
    type?: 'FUNDING' | 'TALENT' | 'SERVICE' | 'PARTNERSHIP';
    location?: string;
    remote?: boolean;
    budgetMin?: number;
    budgetMax?: number;
    skills?: string[];
    authorId?: string;
}
export interface CreateOpportunityData {
    title: string;
    description: string;
    type: 'FUNDING' | 'TALENT' | 'SERVICE' | 'PARTNERSHIP';
    budget?: string;
    amount?: string;
    location?: string;
    remote?: boolean;
    deadline?: Date;
    startDate?: Date;
    skills?: string[];
    experience?: string;
}
export interface CreateMessageData {
    recipientId?: string;
    conversationId?: string;
    content: string;
    type?: 'TEXT' | 'FILE' | 'IMAGE' | 'DOCUMENT';
    attachments?: string[];
}
export interface MessageData {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId?: string;
    content: string;
    type: 'TEXT' | 'FILE' | 'IMAGE' | 'DOCUMENT';
    attachments: string[];
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
}
export interface EventFilters {
    type?: 'CONFERENCE' | 'WORKSHOP' | 'NETWORKING' | 'WEBINAR' | 'MEETUP';
    startDate?: Date;
    endDate?: Date;
    location?: string;
    isOnline?: boolean;
    price?: string;
}
export interface NotificationData {
    id: string;
    type: 'MESSAGE' | 'CONNECTION_REQUEST' | 'OPPORTUNITY_MATCH' | 'APPLICATION_UPDATE' | 'EVENT_REMINDER' | 'SYSTEM';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    actionUrl?: string;
    createdAt: Date;
}
export interface UploadResult {
    url: string;
    publicId: string;
    format: string;
    size: number;
    width?: number;
    height?: number;
}
export interface SocketUser {
    id: string;
    socketId: string;
    name: string;
    avatar?: string;
    profileType: ProfileType;
    lastSeen: Date;
}
export interface SocketMessage {
    type: 'message' | 'typing' | 'user_status' | 'notification';
    data: any;
    timestamp: Date;
}
export interface UserActivityData {
    action: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface AnalyticsData {
    profileViews: number;
    connections: number;
    messages: number;
    opportunities: number;
    period: 'day' | 'week' | 'month' | 'year';
    data: Array<{
        date: string;
        value: number;
    }>;
}
export declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map