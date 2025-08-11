"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = exports.AuditService = exports.AuditActions = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
var AuditActions;
(function (AuditActions) {
    AuditActions["LOGIN"] = "LOGIN";
    AuditActions["LOGOUT"] = "LOGOUT";
    AuditActions["REGISTER"] = "REGISTER";
    AuditActions["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    AuditActions["PASSWORD_RESET"] = "PASSWORD_RESET";
    AuditActions["USER_CREATE"] = "USER_CREATE";
    AuditActions["USER_UPDATE"] = "USER_UPDATE";
    AuditActions["USER_DELETE"] = "USER_DELETE";
    AuditActions["PROFILE_VIEW"] = "PROFILE_VIEW";
    AuditActions["OPPORTUNITY_CREATE"] = "OPPORTUNITY_CREATE";
    AuditActions["OPPORTUNITY_UPDATE"] = "OPPORTUNITY_UPDATE";
    AuditActions["OPPORTUNITY_DELETE"] = "OPPORTUNITY_DELETE";
    AuditActions["OPPORTUNITY_APPLY"] = "OPPORTUNITY_APPLY";
    AuditActions["APPLICATION_UPDATE"] = "APPLICATION_UPDATE";
    AuditActions["EVENT_CREATE"] = "EVENT_CREATE";
    AuditActions["EVENT_UPDATE"] = "EVENT_UPDATE";
    AuditActions["EVENT_DELETE"] = "EVENT_DELETE";
    AuditActions["EVENT_REGISTER"] = "EVENT_REGISTER";
    AuditActions["EVENT_UNREGISTER"] = "EVENT_UNREGISTER";
    AuditActions["RESOURCE_CREATE"] = "RESOURCE_CREATE";
    AuditActions["RESOURCE_UPDATE"] = "RESOURCE_UPDATE";
    AuditActions["RESOURCE_DELETE"] = "RESOURCE_DELETE";
    AuditActions["RESOURCE_VIEW"] = "RESOURCE_VIEW";
    AuditActions["RESOURCE_DOWNLOAD"] = "RESOURCE_DOWNLOAD";
    AuditActions["MESSAGE_SEND"] = "MESSAGE_SEND";
    AuditActions["MESSAGE_READ"] = "MESSAGE_READ";
    AuditActions["MESSAGE_DELETE"] = "MESSAGE_DELETE";
    AuditActions["CONNECTION_REQUEST"] = "CONNECTION_REQUEST";
    AuditActions["CONNECTION_ACCEPT"] = "CONNECTION_ACCEPT";
    AuditActions["CONNECTION_REJECT"] = "CONNECTION_REJECT";
    AuditActions["FILE_UPLOAD"] = "FILE_UPLOAD";
    AuditActions["FILE_DELETE"] = "FILE_DELETE";
    AuditActions["ADMIN_ACTION"] = "ADMIN_ACTION";
    AuditActions["USER_BAN"] = "USER_BAN";
    AuditActions["USER_UNBAN"] = "USER_UNBAN";
    AuditActions["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
    AuditActions["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuditActions["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(AuditActions || (exports.AuditActions = AuditActions = {}));
class AuditService {
    static async log(entry) {
        try {
            logger_1.logger.info('Audit log entry:', {
                ...entry,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to write audit log:', error);
        }
    }
    static async logAuthentication(action, userId, success, ip, userAgent, error) {
        await this.log({
            userId,
            action,
            resource: 'AUTH',
            success,
            ip,
            userAgent,
            error,
        });
    }
    static async logUserAction(action, userId, targetUserId, details, ip, userAgent) {
        await this.log({
            userId,
            action,
            resource: 'USER',
            resourceId: targetUserId,
            details,
            success: true,
            ip,
            userAgent,
        });
    }
    static async logResourceAction(action, userId, resource, resourceId, details, ip, userAgent) {
        await this.log({
            userId,
            action,
            resource: resource.toUpperCase(),
            resourceId,
            details,
            success: true,
            ip,
            userAgent,
        });
    }
    static async logSecurityEvent(action, description, ip, userAgent, userId, details) {
        await this.log({
            userId,
            action,
            resource: 'SECURITY',
            details: { description, ...details },
            success: false,
            ip,
            userAgent,
        });
    }
    static async logAdminAction(action, adminId, targetResource, targetId, details, ip, userAgent) {
        await this.log({
            userId: adminId,
            action,
            resource: targetResource.toUpperCase(),
            resourceId: targetId,
            details: { adminAction: true, ...details },
            success: true,
            ip,
            userAgent,
        });
    }
    static async searchAuditLogs(filters) {
        try {
            logger_1.logger.info('Audit log search requested:', filters);
            return {
                logs: [],
                total: 0,
                message: 'Audit log search not yet implemented - using Winston logs',
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to search audit logs:', error);
            throw error;
        }
    }
    static async getAuditStats(period = 'day') {
        try {
            const now = new Date();
            let startDate;
            switch (period) {
                case 'day':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            return {
                totalEvents: 0,
                loginAttempts: 0,
                failedLogins: 0,
                securityEvents: 0,
                adminActions: 0,
                period,
                startDate: startDate.toISOString(),
                endDate: now.toISOString(),
                message: 'Audit stats not yet implemented - using Winston logs',
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get audit stats:', error);
            throw error;
        }
    }
    static async detectSuspiciousActivity(userId, ip) {
        try {
            const suspiciousPatterns = [];
            logger_1.logger.info('Suspicious activity check requested:', { userId, ip });
            return {
                suspicious: false,
                patterns: suspiciousPatterns,
                riskScore: 0,
                recommendations: [],
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to detect suspicious activity:', error);
            throw error;
        }
    }
}
exports.AuditService = AuditService;
const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const startTime = Date.now();
        const user = req.user;
        const ip = req.ip;
        const userAgent = req.get('User-Agent');
        const originalSend = res.send;
        res.send = function (data) {
            const duration = Date.now() - startTime;
            const success = res.statusCode < 400;
            AuditService.log({
                userId: user?.id,
                action,
                resource,
                resourceId: req.params.id || req.params.userId || req.params.opportunityId,
                details: {
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    duration,
                    body: req.method !== 'GET' ? req.body : undefined,
                },
                success,
                ip,
                userAgent,
                error: success ? undefined : 'Request failed',
            });
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
