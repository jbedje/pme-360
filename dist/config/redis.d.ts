import { RedisClientType } from 'redis';
declare class RedisManager {
    private client;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType | null;
    isReady(): boolean;
    set(key: string, value: string, expirationInSeconds?: number): Promise<boolean>;
    setex(key: string, seconds: number, value: string): Promise<boolean>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    cacheSet(key: string, data: any, ttlSeconds?: number): Promise<boolean>;
    cacheGet<T>(key: string): Promise<T | null>;
    setSession(sessionId: string, userData: any, ttlSeconds?: number): Promise<boolean>;
    getSession<T>(sessionId: string): Promise<T | null>;
    deleteSession(sessionId: string): Promise<boolean>;
    incrementRateLimit(key: string, windowSeconds: number): Promise<number>;
}
declare const redisManager: RedisManager;
export { redisManager };
export default redisManager;
//# sourceMappingURL=redis.d.ts.map