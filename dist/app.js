"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const redis_1 = __importDefault(require("./config/redis"));
const auth_1 = __importDefault(require("./routes/auth"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                const allowedOrigins = [
                    config_1.config.FRONTEND_URL,
                    'http://localhost:3000',
                    'http://localhost:3002',
                ];
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    logger_1.logger.warn(`🚫 CORS blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'Authorization',
                'Cache-Control',
            ],
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: config_1.config.RATE_LIMIT_WINDOW_MS,
            max: config_1.config.RATE_LIMIT_MAX_REQUESTS,
            message: {
                error: 'Trop de requêtes, veuillez réessayer plus tard.',
                retryAfter: Math.ceil(config_1.config.RATE_LIMIT_WINDOW_MS / 1000),
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                return req.path === '/health' || req.path === '/api/v1/health';
            },
        });
        this.app.use(limiter);
        const morganFormat = config_1.config.NODE_ENV === 'production' ? 'combined' : 'dev';
        this.app.use((0, morgan_1.default)(morganFormat, { stream: logger_1.morganStream }));
        this.app.set('trust proxy', 1);
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                message: 'PME 360 Backend is running',
                timestamp: new Date().toISOString(),
                environment: config_1.config.NODE_ENV,
                uptime: process.uptime(),
            });
        });
        this.app.get(config_1.config.API_PREFIX, (req, res) => {
            res.json({
                message: 'PME 360 API v1',
                version: '1.0.0',
                status: 'active',
                endpoints: {
                    auth: `${config_1.config.API_PREFIX}/auth`,
                    users: `${config_1.config.API_PREFIX}/users`,
                    opportunities: `${config_1.config.API_PREFIX}/opportunities`,
                    messages: `${config_1.config.API_PREFIX}/messages`,
                    resources: `${config_1.config.API_PREFIX}/resources`,
                    events: `${config_1.config.API_PREFIX}/events`,
                    notifications: `${config_1.config.API_PREFIX}/notifications`,
                },
            });
        });
        this.app.use(`${config_1.config.API_PREFIX}/auth`, auth_1.default);
        this.app.use('*', (req, res) => {
            logger_1.logger.warn(`🔍 404 - Route not found: ${req.method} ${req.originalUrl}`);
            res.status(404).json({
                error: 'Route not found',
                message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
                timestamp: new Date().toISOString(),
            });
        });
    }
    initializeErrorHandling() {
        this.app.use((error, req, res, next) => {
            const status = error.status || error.statusCode || 500;
            const message = error.message || 'Une erreur interne s\'est produite';
            logger_1.logger.error(`🚨 ${status} Error:`, {
                message: error.message,
                stack: error.stack,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });
            const errorResponse = {
                error: message,
                status,
                timestamp: new Date().toISOString(),
            };
            if (config_1.config.NODE_ENV === 'development') {
                errorResponse.stack = error.stack;
            }
            res.status(status).json(errorResponse);
        });
        process.on('unhandledRejection', (reason) => {
            logger_1.logger.error('🚨 Unhandled Promise Rejection:', reason);
        });
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('🚨 Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('SIGTERM', () => {
            logger_1.logger.info('🛑 SIGTERM received, shutting down gracefully');
            this.gracefulShutdown();
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('🛑 SIGINT received, shutting down gracefully');
            this.gracefulShutdown();
        });
    }
    async gracefulShutdown() {
        logger_1.logger.info('🔄 Starting graceful shutdown...');
        try {
            await Promise.all([
                redis_1.default.disconnect(),
            ]);
            logger_1.logger.info('✅ Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('❌ Error during graceful shutdown:', error);
            process.exit(1);
        }
    }
    async initialize() {
        try {
            await (0, database_1.connectDatabase)();
            await redis_1.default.connect();
            logger_1.logger.info('✅ App initialization completed');
        }
        catch (error) {
            logger_1.logger.error('❌ App initialization failed:', error);
            process.exit(1);
        }
    }
    getExpressApp() {
        return this.app;
    }
}
exports.default = App;
