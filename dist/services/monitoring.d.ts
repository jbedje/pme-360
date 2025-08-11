export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    environment: string;
    checks: {
        database: HealthCheck;
        memory: HealthCheck;
        disk: HealthCheck;
        external: HealthCheck;
    };
    metrics: SystemMetrics;
}
export interface HealthCheck {
    status: 'pass' | 'warn' | 'fail';
    responseTime?: number;
    message?: string;
    details?: any;
}
export interface SystemMetrics {
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        used: number;
        free: number;
        total: number;
        usagePercent: number;
    };
    process: {
        pid: number;
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
    };
    requests: {
        total: number;
        errors: number;
        averageResponseTime: number;
    };
}
export declare class MonitoringService {
    static getHealthStatus(): Promise<HealthStatus>;
    private static checkDatabase;
    private static checkMemory;
    private static checkDisk;
    private static checkExternalServices;
    private static getSystemMetrics;
    private static determineOverallStatus;
    static requestMetricsMiddleware(): (req: any, res: any, next: any) => void;
    static getDatabaseMetrics(): Promise<{
        tables: {
            users: number;
            opportunities: number;
            events: number;
            messages: number;
        };
        timestamp: string;
    }>;
    static resetMetrics(): void;
    static checkAlerts(): Promise<Alert[]>;
}
interface Alert {
    type: 'info' | 'warning' | 'critical';
    message: string;
    details: any;
    timestamp: string;
}
export {};
//# sourceMappingURL=monitoring.d.ts.map