export interface AuditLogEntry {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
}
export declare enum AuditActions {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    REGISTER = "REGISTER",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    PASSWORD_RESET = "PASSWORD_RESET",
    USER_CREATE = "USER_CREATE",
    USER_UPDATE = "USER_UPDATE",
    USER_DELETE = "USER_DELETE",
    PROFILE_VIEW = "PROFILE_VIEW",
    OPPORTUNITY_CREATE = "OPPORTUNITY_CREATE",
    OPPORTUNITY_UPDATE = "OPPORTUNITY_UPDATE",
    OPPORTUNITY_DELETE = "OPPORTUNITY_DELETE",
    OPPORTUNITY_APPLY = "OPPORTUNITY_APPLY",
    APPLICATION_UPDATE = "APPLICATION_UPDATE",
    EVENT_CREATE = "EVENT_CREATE",
    EVENT_UPDATE = "EVENT_UPDATE",
    EVENT_DELETE = "EVENT_DELETE",
    EVENT_REGISTER = "EVENT_REGISTER",
    EVENT_UNREGISTER = "EVENT_UNREGISTER",
    RESOURCE_CREATE = "RESOURCE_CREATE",
    RESOURCE_UPDATE = "RESOURCE_UPDATE",
    RESOURCE_DELETE = "RESOURCE_DELETE",
    RESOURCE_VIEW = "RESOURCE_VIEW",
    RESOURCE_DOWNLOAD = "RESOURCE_DOWNLOAD",
    MESSAGE_SEND = "MESSAGE_SEND",
    MESSAGE_READ = "MESSAGE_READ",
    MESSAGE_DELETE = "MESSAGE_DELETE",
    CONNECTION_REQUEST = "CONNECTION_REQUEST",
    CONNECTION_ACCEPT = "CONNECTION_ACCEPT",
    CONNECTION_REJECT = "CONNECTION_REJECT",
    FILE_UPLOAD = "FILE_UPLOAD",
    FILE_DELETE = "FILE_DELETE",
    ADMIN_ACTION = "ADMIN_ACTION",
    USER_BAN = "USER_BAN",
    USER_UNBAN = "USER_UNBAN",
    SECURITY_VIOLATION = "SECURITY_VIOLATION",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
export declare class AuditService {
    static log(entry: AuditLogEntry): Promise<void>;
    static logAuthentication(action: AuditActions.LOGIN | AuditActions.LOGOUT | AuditActions.REGISTER, userId: string, success: boolean, ip?: string, userAgent?: string, error?: string): Promise<void>;
    static logUserAction(action: AuditActions, userId: string, targetUserId?: string, details?: any, ip?: string, userAgent?: string): Promise<void>;
    static logResourceAction(action: AuditActions, userId: string, resource: string, resourceId: string, details?: any, ip?: string, userAgent?: string): Promise<void>;
    static logSecurityEvent(action: AuditActions, description: string, ip?: string, userAgent?: string, userId?: string, details?: any): Promise<void>;
    static logAdminAction(action: AuditActions, adminId: string, targetResource: string, targetId: string, details?: any, ip?: string, userAgent?: string): Promise<void>;
    static searchAuditLogs(filters: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        ip?: string;
        success?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        logs: never[];
        total: number;
        message: string;
    }>;
    static getAuditStats(period?: 'day' | 'week' | 'month'): Promise<{
        totalEvents: number;
        loginAttempts: number;
        failedLogins: number;
        securityEvents: number;
        adminActions: number;
        period: "day" | "week" | "month";
        startDate: string;
        endDate: string;
        message: string;
    }>;
    static detectSuspiciousActivity(userId: string, ip?: string): Promise<{
        suspicious: boolean;
        patterns: any[];
        riskScore: number;
        recommendations: never[];
    }>;
}
export declare const auditMiddleware: (action: AuditActions, resource: string) => (req: any, res: any, next: any) => Promise<void>;
//# sourceMappingURL=audit.d.ts.map