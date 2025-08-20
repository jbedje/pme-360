// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profileType: string;
  company?: string;
  location?: string;
  avatar?: string;
  description?: string;
  website?: string;
  phone?: string;
  verified?: boolean;
  status?: string;
  completionScore?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  lastLogin?: string;
  expertises?: Array<{
    name: string;
    level: number;
    verified: boolean;
  }>;
  _count?: {
    sentMessages: number;
    receivedMessages: number;
    opportunities: number;
    applications: number;
    events: number;
    eventRegistrations: number;
    resources: number;
    resourceViews: number;
    notifications: number;
    connections: number;
    connectedTo: number;
  };
}

export enum ProfileType {
  PME = 'PME',
  STARTUP = 'STARTUP',
  EXPERT = 'EXPERT', 
  MENTOR = 'MENTOR',
  INCUBATOR = 'INCUBATOR',
  INVESTOR = 'INVESTOR',
  FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION',
  PUBLIC_ORGANIZATION = 'PUBLIC_ORGANIZATION',
  TECH_PARTNER = 'TECH_PARTNER',
  ADMIN = 'ADMIN'
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  profileType: string;
  company?: string;
  location?: string;
  description?: string;
  website?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn?: number;
  };
  message: string;
}

// Message types
export interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

export interface CreateMessageRequest {
  subject: string;
  content: string;
  receiverId: string;
  attachmentUrl?: string;
}

// Opportunity types
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  budget?: number;
  location?: string;
  deadline?: string;
  requirements?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  applications: Application[];
  _count?: {
    applications: number;
  };
}

export enum OpportunityType {
  FUNDING = 'FUNDING',
  PARTNERSHIP = 'PARTNERSHIP',
  CONTRACT = 'CONTRACT',
  MENTORSHIP = 'MENTORSHIP',
  INVESTMENT = 'INVESTMENT'
}

export interface Application {
  id: string;
  opportunityId: string;
  userId: string;
  coverLetter: string;
  proposedBudget?: number;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  opportunity: Opportunity;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  capacity?: number;
  imageUrl?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  registrations: EventRegistration[];
  _count?: {
    registrations: number;
  };
}

export enum EventType {
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  NETWORKING = 'NETWORKING',
  WEBINAR = 'WEBINAR',
  DEMO_DAY = 'DEMO_DAY'
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  event: Event;
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  ATTENDED = 'ATTENDED',
  CANCELLED = 'CANCELLED'
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: ResourceType;
  tags?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  views: ResourceView[];
  _count?: {
    views: number;
  };
}

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  TEMPLATE = 'TEMPLATE',
  GUIDE = 'GUIDE',
  TOOL = 'TOOL',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

export interface ResourceView {
  id: string;
  resourceId: string;
  userId: string;
  viewedAt: string;
  user: User;
  resource: Resource;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_OPPORTUNITY = 'NEW_OPPORTUNITY',
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  EVENT_REMINDER = 'EVENT_REMINDER',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

// Connection types
export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  requester: User;
  receiver: User;
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// Analytics types
export interface PlatformStats {
  totalUsers: number;
  totalMessages: number;
  totalOpportunities: number;
  totalEvents: number;
  totalResources: number;
  totalNotifications: number;
  totalConnections: number;
  usersByType: Record<ProfileType, number>;
  opportunitiesByType: Record<OpportunityType, number>;
  eventsByType: Record<EventType, number>;
  resourcesByType: Record<ResourceType, number>;
  notificationsByType: Record<NotificationType, number>;
}

export interface UserActivity {
  messagesSent: number;
  messagesReceived: number;
  opportunitiesCreated: number;
  opportunityApplications: number;
  eventsCreated: number;
  eventRegistrations: number;
  resourcesCreated: number;
  resourceViews: number;
  connectionsRequested: number;
  connectionsReceived: number;
}

export interface EngagementMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Upload types
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
  message: string;
}

// Filter and search types
export interface FilterOptions {
  search?: string;
  type?: string;
  location?: string;
  sector?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}