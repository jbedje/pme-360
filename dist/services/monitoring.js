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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const os_1 = __importDefault(require("os"));
const perf_hooks_1 = require("perf_hooks");
const prisma = new client_1.PrismaClient();
let requestMetrics = {
    total: 0,
    errors: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
};
class MonitoringService {
    static async getHealthStatus() {
        const startTime = perf_hooks_1.performance.now();
        try {
            const [databaseCheck, memoryCheck, diskCheck, externalCheck] = await Promise.all([
                this.checkDatabase(),
                this.checkMemory(),
                this.checkDisk(),
                this.checkExternalServices(),
            ]);
            const metrics = this.getSystemMetrics();
            const checks = { database: databaseCheck, memory: memoryCheck, disk: diskCheck, external: externalCheck };
            const overallStatus = this.determineOverallStatus(checks);
            const healthStatus = {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: Math.floor(process.uptime()),
                environment: process.env.NODE_ENV || 'development',
                checks,
                metrics,
            };
            const responseTime = perf_hooks_1.performance.now() - startTime;
            logger_1.logger.info('Health check completed', {
                status: overallStatus,
                responseTime: Math.round(responseTime),
                timestamp: healthStatus.timestamp
            });
            return healthStatus;
        }
        catch (error) {
            logger_1.logger.error('Health check failed:', error);
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: Math.floor(process.uptime()),
                environment: process.env.NODE_ENV || 'development',
                checks: {
                    database: { status: 'fail', message: 'Health check system failure' },
                    memory: { status: 'fail', message: 'Health check system failure' },
                    disk: { status: 'fail', message: 'Health check system failure' },
                    external: { status: 'fail', message: 'Health check system failure' },
                },
                metrics: this.getSystemMetrics(),
            };
        }
    }
    static async checkDatabase() {
        const startTime = perf_hooks_1.performance.now();
        try {
            await prisma.$queryRaw `SELECT 1`;
            const responseTime = perf_hooks_1.performance.now() - startTime;
            if (responseTime > 1000) {
                return {
                    status: 'warn',
                    responseTime: Math.round(responseTime),
                    message: 'Database response time is slow',
                };
            }
            return {
                status: 'pass',
                responseTime: Math.round(responseTime),
                message: 'Database connection healthy',
            };
        }
        catch (error) {
            logger_1.logger.error('Database health check failed:', error);
            return {
                status: 'fail',
                responseTime: perf_hooks_1.performance.now() - startTime,
                message: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static async checkMemory() {
        try {
            const memInfo = process.memoryUsage();
            const totalMem = os_1.default.totalmem();
            const freeMem = os_1.default.freemem();
            const usedMem = totalMem - freeMem;
            const usagePercent = (usedMem / totalMem) * 100;
            if (usagePercent > 90) {
                return {
                    status: 'fail',
                    message: 'Memory usage critical',
                    details: {
                        usagePercent: Math.round(usagePercent),
                        processHeapUsed: Math.round(memInfo.heapUsed / 1024 / 1024),
                    },
                };
            }
            if (usagePercent > 80) {
                return {
                    status: 'warn',
                    message: 'Memory usage high',
                    details: {
                        usagePercent: Math.round(usagePercent),
                        processHeapUsed: Math.round(memInfo.heapUsed / 1024 / 1024),
                    },
                };
            }
            return {
                status: 'pass',
                message: 'Memory usage normal',
                details: {
                    usagePercent: Math.round(usagePercent),
                    processHeapUsed: Math.round(memInfo.heapUsed / 1024 / 1024),
                },
            };
        }
        catch (error) {
            return {
                status: 'fail',
                message: 'Memory check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static async checkDisk() {
        try {
            const tmpDir = os_1.default.tmpdir();
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const testFile = `${tmpDir}/health-check-${Date.now()}.tmp`;
            const startTime = perf_hooks_1.performance.now();
            await fs.writeFile(testFile, 'health check test');
            await fs.readFile(testFile);
            await fs.unlink(testFile);
            const responseTime = perf_hooks_1.performance.now() - startTime;
            if (responseTime > 500) {
                return {
                    status: 'warn',
                    responseTime: Math.round(responseTime),
                    message: 'Disk I/O performance degraded',
                };
            }
            return {
                status: 'pass',
                responseTime: Math.round(responseTime),
                message: 'Disk I/O healthy',
            };
        }
        catch (error) {
            return {
                status: 'fail',
                message: 'Disk check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static async checkExternalServices() {
        try {
            const checks = [];
            try {
                const dns = await Promise.resolve().then(() => __importStar(require('dns/promises')));
                await dns.resolve('google.com');
                checks.push({ service: 'dns', status: 'pass' });
            }
            catch (error) {
                checks.push({ service: 'dns', status: 'fail', error: error instanceof Error ? error.message : 'Unknown' });
            }
            const failedServices = checks.filter(c => c.status === 'fail');
            if (failedServices.length > 0) {
                return {
                    status: 'warn',
                    message: 'Some external services unavailable',
                    details: { checks, failedCount: failedServices.length },
                };
            }
            return {
                status: 'pass',
                message: 'External services healthy',
                details: { checks },
            };
        }
        catch (error) {
            return {
                status: 'fail',
                message: 'External services check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static getSystemMetrics() {
        const memInfo = process.memoryUsage();
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const usedMem = totalMem - freeMem;
        return {
            cpu: {
                usage: 0,
                loadAverage: os_1.default.loadavg(),
            },
            memory: {
                used: usedMem,
                free: freeMem,
                total: totalMem,
                usagePercent: (usedMem / totalMem) * 100,
            },
            process: {
                pid: process.pid,
                uptime: Math.floor(process.uptime()),
                memoryUsage: memInfo,
            },
            requests: {
                total: requestMetrics.total,
                errors: requestMetrics.errors,
                averageResponseTime: requestMetrics.averageResponseTime,
            },
        };
    }
    static determineOverallStatus(checks) {
        const checkValues = Object.values(checks);
        const failedCount = checkValues.filter(c => c.status === 'fail').length;
        const warnCount = checkValues.filter(c => c.status === 'warn').length;
        if (failedCount > 0) {
            return 'unhealthy';
        }
        if (warnCount > 0) {
            return 'degraded';
        }
        return 'healthy';
    }
    static requestMetricsMiddleware() {
        return (req, res, next) => {
            const startTime = perf_hooks_1.performance.now();
            requestMetrics.total++;
            const originalEnd = res.end;
            res.end = function (...args) {
                const responseTime = perf_hooks_1.performance.now() - startTime;
                requestMetrics.totalResponseTime += responseTime;
                requestMetrics.averageResponseTime = requestMetrics.totalResponseTime / requestMetrics.total;
                if (res.statusCode >= 400) {
                    requestMetrics.errors++;
                }
                return originalEnd.apply(this, args);
            };
            next();
        };
    }
    static async getDatabaseMetrics() {
        try {
            const [userCount, opportunityCount, eventCount, messageCount] = await Promise.all([
                prisma.user.count(),
                prisma.opportunity.count(),
                prisma.event.count(),
                prisma.message.count(),
            ]);
            return {
                tables: {
                    users: userCount,
                    opportunities: opportunityCount,
                    events: eventCount,
                    messages: messageCount,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get database metrics:', error);
            throw error;
        }
    }
    static resetMetrics() {
        requestMetrics = {
            total: 0,
            errors: 0,
            totalResponseTime: 0,
            averageResponseTime: 0,
        };
        logger_1.logger.info('Request metrics reset');
    }
    static async checkAlerts() {
        const alerts = [];
        const health = await this.getHealthStatus();
        if (health.status === 'unhealthy') {
            alerts.push({
                type: 'critical',
                message: 'System is unhealthy',
                details: health.checks,
                timestamp: new Date().toISOString(),
            });
        }
        if (health.metrics.memory.usagePercent > 85) {
            alerts.push({
                type: 'warning',
                message: 'High memory usage detected',
                details: { usagePercent: health.metrics.memory.usagePercent },
                timestamp: new Date().toISOString(),
            });
        }
        if (health.metrics.requests.errors / health.metrics.requests.total > 0.1) {
            alerts.push({
                type: 'warning',
                message: 'High error rate detected',
                details: {
                    errorRate: (health.metrics.requests.errors / health.metrics.requests.total) * 100,
                    totalRequests: health.metrics.requests.total,
                    errors: health.metrics.requests.errors,
                },
                timestamp: new Date().toISOString(),
            });
        }
        return alerts;
    }
}
exports.MonitoringService = MonitoringService;
