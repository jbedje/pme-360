"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const redis_1 = require("redis");
const logger_1 = require("./logger");
class RedisManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    async connect() {
        try {
            if (this.client) {
                return;
            }
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 3) {
                            logger_1.logger.error('❌ Redis: Too many retry attempts, giving up');
                            return new Error('Too many retries');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });
            this.client.on('error', (error) => {
                logger_1.logger.error('❌ Redis Client Error:', error);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                logger_1.logger.info('🔄 Redis: Connecting...');
            });
            this.client.on('ready', () => {
                logger_1.logger.info('✅ Redis: Connected and ready');
                this.isConnected = true;
            });
            this.client.on('end', () => {
                logger_1.logger.info('🔴 Redis: Connection ended');
                this.isConnected = false;
            });
            await this.client.connect();
        }
        catch (error) {
            logger_1.logger.error('❌ Redis connection failed:', error);
            this.client = null;
            this.isConnected = false;
        }
    }
    async disconnect() {
        try {
            if (this.client && this.isConnected) {
                await this.client.quit();
                logger_1.logger.info('✅ Redis: Disconnected successfully');
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Redis disconnection error:', error);
        }
        finally {
            this.client = null;
            this.isConnected = false;
        }
    }
    getClient() {
        return this.client;
    }
    isReady() {
        return this.isConnected && this.client !== null;
    }
    async set(key, value, expirationInSeconds) {
        try {
            if (!this.client || !this.isConnected) {
                logger_1.logger.warn('⚠️ Redis: Client not ready for SET operation');
                return false;
            }
            if (expirationInSeconds) {
                await this.client.setEx(key, expirationInSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('❌ Redis SET error:', error);
            return false;
        }
    }
    async setex(key, seconds, value) {
        return await this.set(key, value, seconds);
    }
    async get(key) {
        try {
            if (!this.client || !this.isConnected) {
                logger_1.logger.warn('⚠️ Redis: Client not ready for GET operation');
                return null;
            }
            return await this.client.get(key);
        }
        catch (error) {
            logger_1.logger.error('❌ Redis GET error:', error);
            return null;
        }
    }
    async del(key) {
        try {
            if (!this.client || !this.isConnected) {
                logger_1.logger.warn('⚠️ Redis: Client not ready for DEL operation');
                return false;
            }
            const result = await this.client.del(key);
            return result > 0;
        }
        catch (error) {
            logger_1.logger.error('❌ Redis DEL error:', error);
            return false;
        }
    }
    async exists(key) {
        try {
            if (!this.client || !this.isConnected) {
                return false;
            }
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error('❌ Redis EXISTS error:', error);
            return false;
        }
    }
    async cacheSet(key, data, ttlSeconds = 300) {
        try {
            const serializedData = JSON.stringify(data);
            return await this.set(key, serializedData, ttlSeconds);
        }
        catch (error) {
            logger_1.logger.error('❌ Redis cache SET error:', error);
            return false;
        }
    }
    async cacheGet(key) {
        try {
            const data = await this.get(key);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (error) {
            logger_1.logger.error('❌ Redis cache GET error:', error);
            return null;
        }
    }
    async setSession(sessionId, userData, ttlSeconds = 86400) {
        const sessionKey = `session:${sessionId}`;
        return await this.cacheSet(sessionKey, userData, ttlSeconds);
    }
    async getSession(sessionId) {
        const sessionKey = `session:${sessionId}`;
        return await this.cacheGet(sessionKey);
    }
    async deleteSession(sessionId) {
        const sessionKey = `session:${sessionId}`;
        return await this.del(sessionKey);
    }
    async incrementRateLimit(key, windowSeconds) {
        try {
            if (!this.client || !this.isConnected) {
                return 0;
            }
            const result = await this.client.incr(key);
            if (result === 1) {
                await this.client.expire(key, windowSeconds);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('❌ Redis rate limit error:', error);
            return 0;
        }
    }
}
const redisManager = new RedisManager();
exports.redisManager = redisManager;
exports.default = redisManager;
