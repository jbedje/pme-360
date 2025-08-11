"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./logger");
dotenv_1.default.config();
const validateConfig = () => {
    const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'FRONTEND_URL',
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        logger_1.logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        API_PREFIX: process.env.API_PREFIX || '/api/v1',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        FRONTEND_URL: process.env.FRONTEND_URL,
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
        FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@pme360.com',
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@pme360.com',
    };
};
exports.config = validateConfig();
const logConfig = () => {
    const safeConfig = {
        ...exports.config,
        JWT_SECRET: '[HIDDEN]',
        JWT_REFRESH_SECRET: '[HIDDEN]',
        DATABASE_URL: exports.config.DATABASE_URL.replace(/\/\/.*:.*@/, '//[HIDDEN]@'),
        CLOUDINARY_API_SECRET: '[HIDDEN]',
        SENDGRID_API_KEY: '[HIDDEN]',
    };
    logger_1.logger.info('🔧 Configuration loaded:');
    logger_1.logger.info(JSON.stringify(safeConfig, null, 2));
};
exports.logConfig = logConfig;
exports.default = exports.config;
