import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Message,
  CreateMessageRequest,
  Opportunity,
  Application,
  Event,
  EventRegistration,
  Resource,
  ResourceView,
  Notification,
  Connection,
  PlatformStats,
  UserActivity,
  EngagementMetrics,
  UploadResponse,
  FilterOptions,
  ProfileType,
  OpportunityType,
  EventType,
  ResourceType,
  NotificationType,
  ConnectionStatus,
  ApplicationStatus,
  RegistrationStatus
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3000/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('auth_token', response.data.token);
              return this.api(original);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response.data.success) {
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data!;
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse['data']> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    const data = this.handleResponse(response);
    
    // Store tokens
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse['data']> {
    const response = await this.api.post<AuthResponse>('/auth/register', userData);
    const data = this.handleResponse(response);
    
    // Store tokens
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue even if logout fails on server
    }
    
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/profile');
    return this.handleResponse(response);
  }

  // User methods
  async getUsers(filters?: FilterOptions): Promise<PaginatedResponse<User>['data']> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
    return response.data.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>(`/users/${id}`);
    return this.handleResponse(response);
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>('/users/me', userData);
    return this.handleResponse(response);
  }

  async connectToUser(userId: string): Promise<Connection> {
    const response = await this.api.post<ApiResponse<Connection>>('/users/connect', { userId });
    return this.handleResponse(response);
  }

  // Message methods
  async getMessages(filters?: FilterOptions): Promise<Message[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get<ApiResponse<Message[]>>(`/messages?${params.toString()}`);
    return this.handleResponse(response);
  }

  async getMessage(id: string): Promise<Message> {
    const response = await this.api.get<ApiResponse<Message>>(`/messages/${id}`);
    return this.handleResponse(response);
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<Message> {
    const response = await this.api.post<ApiResponse<Message>>('/messages', messageData);
    return this.handleResponse(response);
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const response = await this.api.put<ApiResponse<Message>>(`/messages/${id}/read`);
    return this.handleResponse(response);
  }

  // Opportunity methods
  async getOpportunities(filters?: FilterOptions): Promise<Opportunity[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get<ApiResponse<Opportunity[]>>(`/opportunities?${params.toString()}`);
    return this.handleResponse(response);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    const response = await this.api.get<ApiResponse<Opportunity>>(`/opportunities/${id}`);
    return this.handleResponse(response);
  }

  async createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'createdById' | 'createdAt' | 'updatedAt' | 'createdBy' | 'applications' | '_count'>): Promise<Opportunity> {
    const response = await this.api.post<ApiResponse<Opportunity>>('/opportunities', opportunityData);
    return this.handleResponse(response);
  }

  async updateOpportunity(id: string, opportunityData: Partial<Opportunity>): Promise<Opportunity> {
    const response = await this.api.put<ApiResponse<Opportunity>>(`/opportunities/${id}`, opportunityData);
    return this.handleResponse(response);
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.api.delete(`/opportunities/${id}`);
  }

  async applyToOpportunity(opportunityId: string, applicationData: { coverLetter: string; proposedBudget?: number }): Promise<Application> {
    const response = await this.api.post<ApiResponse<Application>>(`/opportunities/${opportunityId}/apply`, applicationData);
    return this.handleResponse(response);
  }

  // Event methods
  async getEvents(filters?: FilterOptions): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get<ApiResponse<Event[]>>(`/events?${params.toString()}`);
    return this.handleResponse(response);
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.api.get<ApiResponse<Event>>(`/events/${id}`);
    return this.handleResponse(response);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdById' | 'createdAt' | 'updatedAt' | 'createdBy' | 'registrations' | '_count'>): Promise<Event> {
    const response = await this.api.post<ApiResponse<Event>>('/events', eventData);
    return this.handleResponse(response);
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const response = await this.api.put<ApiResponse<Event>>(`/events/${id}`, eventData);
    return this.handleResponse(response);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.api.delete(`/events/${id}`);
  }

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    const response = await this.api.post<ApiResponse<EventRegistration>>(`/events/${eventId}/register`);
    return this.handleResponse(response);
  }

  // Resource methods
  async getResources(filters?: FilterOptions): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get<ApiResponse<Resource[]>>(`/resources?${params.toString()}`);
    return this.handleResponse(response);
  }

  async getResource(id: string): Promise<Resource> {
    const response = await this.api.get<ApiResponse<Resource>>(`/resources/${id}`);
    return this.handleResponse(response);
  }

  async createResource(resourceData: Omit<Resource, 'id' | 'createdById' | 'createdAt' | 'updatedAt' | 'createdBy' | 'views' | '_count'>): Promise<Resource> {
    const response = await this.api.post<ApiResponse<Resource>>('/resources', resourceData);
    return this.handleResponse(response);
  }

  async updateResource(id: string, resourceData: Partial<Resource>): Promise<Resource> {
    const response = await this.api.put<ApiResponse<Resource>>(`/resources/${id}`, resourceData);
    return this.handleResponse(response);
  }

  async deleteResource(id: string): Promise<void> {
    await this.api.delete(`/resources/${id}`);
  }

  async viewResource(id: string): Promise<ResourceView> {
    const response = await this.api.post<ApiResponse<ResourceView>>(`/resources/${id}/view`);
    return this.handleResponse(response);
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    const response = await this.api.get<ApiResponse<Notification[]>>('/notifications');
    return this.handleResponse(response);
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const response = await this.api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return this.handleResponse(response);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(`/notifications/${id}`);
  }

  // Upload methods
  async uploadFile(file: File, type: 'avatar' | 'resource-thumbnail' | 'message-attachment' | 'event-image'): Promise<UploadResponse['data']> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<UploadResponse>(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return this.handleResponse(response);
  }

  // Analytics methods (admin only)
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await this.api.get<ApiResponse<PlatformStats>>('/analytics/platform');
    return this.handleResponse(response);
  }

  async getUserActivity(userId?: string): Promise<UserActivity> {
    const url = userId ? `/analytics/user/${userId}` : '/analytics/my-activity';
    const response = await this.api.get<ApiResponse<UserActivity>>(url);
    return this.handleResponse(response);
  }

  async getEngagementMetrics(): Promise<EngagementMetrics> {
    const response = await this.api.get<ApiResponse<EngagementMetrics>>('/analytics/engagement');
    return this.handleResponse(response);
  }

  // Connection methods
  async getConnections(): Promise<Connection[]> {
    const response = await this.api.get<ApiResponse<Connection[]>>('/connections');
    return this.handleResponse(response);
  }

  async respondToConnection(connectionId: string, accept: boolean): Promise<Connection> {
    const response = await this.api.put<ApiResponse<Connection>>(`/connections/${connectionId}`, {
      status: accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;