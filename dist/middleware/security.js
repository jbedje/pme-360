"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = exports.auditLog = exports.removeFromBlacklist = exports.addToBlacklist = exports.ipBlacklist = exports.botDetection = exports.attackDetection = exports.compressionMiddleware = exports.speedLimiter = exports.analyticsRateLimit = exports.messageRateLimit = exports.uploadRateLimit = exports.authRateLimit = exports.generalRateLimit = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const compression_1 = __importDefault(require("compression"));
const logger_1 = require("../config/logger");
const config_1 = require("../config");
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", 'wss:', 'ws:'],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'same-origin' },
});
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.RATE_LIMIT_WINDOW_MS,
    max: config_1.config.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: Math.ceil(config_1.config.RATE_LIMIT_WINDOW_MS / 60000),
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = req.user;
        return user ? `${req.ip}-${user.id}` : req.ip;
    },
    handler: (req, res) => {
        logger_1.logger.warn('Rate limit exceeded:', {
            ip: req.ip,
            url: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
        });
        res.status(429).json({
            success: false,
            error: 'Trop de requêtes, veuillez réessayer plus tard',
            retryAfter: Math.ceil(config_1.config.RATE_LIMIT_WINDOW_MS / 60000),
            timestamp: new Date().toISOString(),
        });
    },
});
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Trop d\'uploads, veuillez attendre avant de réessayer',
        timestamp: new Date().toISOString(),
    },
});
exports.messageRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'Trop de messages envoyés, veuillez ralentir',
        timestamp: new Date().toISOString(),
    },
});
exports.analyticsRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Trop de requêtes analytics, veuillez attendre',
        timestamp: new Date().toISOString(),
    },
});
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 100,
    maxDelayMs: 20000,
});
exports.compressionMiddleware = (0, compression_1.default)({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    level: 6,
    threshold: 1024,
});
const attackDetection = (req, res, next) => {
    const suspiciousPatterns = [
        /(\%27)|(\')|(\")|(\%22)|(\-\-)|(\%3D)|(=).*(\%27)|(\').*(\;)|(\%3B)/i,
        /(<script[^>]*>.*?<\/script>)|(<iframe[^>]*>.*?<\/iframe>)|(<object[^>]*>.*?<\/object>)/i,
        /(\.\.|\.\/|\\\.\.)/i,
        /(;|\||&|`|\$\(|\$\{)/i,
    ];
    const userAgent = req.get('User-Agent') || '';
    const url = req.originalUrl;
    const body = JSON.stringify(req.body);
    const query = JSON.stringify(req.query);
    const testString = `${url} ${body} ${query} ${userAgent}`;
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(testString)) {
            logger_1.logger.warn('Suspicious request detected:', {
                ip: req.ip,
                userAgent,
                url,
                method: req.method,
                body: req.body,
                query: req.query,
                pattern: pattern.toString(),
                timestamp: new Date().toISOString(),
            });
            return res.status(400).json({
                success: false,
                error: 'Requête suspecte détectée',
                timestamp: new Date().toISOString(),
            });
        }
    }
    next();
};
exports.attackDetection = attackDetection;
const botDetection = (req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const maliciousBots = [
        /sqlmap/i,
        /nikto/i,
        /masscan/i,
        /nmap/i,
        /zap/i,
        /burp/i,
        /acunetix/i,
        /nessus/i,
    ];
    for (const botPattern of maliciousBots) {
        if (botPattern.test(userAgent)) {
            logger_1.logger.warn('Malicious bot detected:', {
                ip: req.ip,
                userAgent,
                url: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
            return res.status(403).json({
                success: false,
                error: 'Accès interdit',
                timestamp: new Date().toISOString(),
            });
        }
    }
    next();
};
exports.botDetection = botDetection;
const blacklistedIPs = new Set();
const ipBlacklist = (req, res, next) => {
    const clientIP = req.ip;
    if (blacklistedIPs.has(clientIP)) {
        logger_1.logger.warn('Blacklisted IP attempted access:', {
            ip: clientIP,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            success: false,
            error: 'Accès refusé',
            timestamp: new Date().toISOString(),
        });
    }
    next();
};
exports.ipBlacklist = ipBlacklist;
const addToBlacklist = (ip, reason) => {
    blacklistedIPs.add(ip);
    logger_1.logger.info(`IP added to blacklist: ${ip}`, { reason });
};
exports.addToBlacklist = addToBlacklist;
const removeFromBlacklist = (ip) => {
    blacklistedIPs.delete(ip);
    logger_1.logger.info(`IP removed from blacklist: ${ip}`);
};
exports.removeFromBlacklist = removeFromBlacklist;
const auditLog = (req, res, next) => {
    const startTime = Date.now();
    const user = req.user;
    const requestLog = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
    };
    logger_1.logger.info('Request received:', requestLog);
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        logger_1.logger.info('Request completed:', {
            ...requestLog,
            statusCode: res.statusCode,
            duration,
            responseSize: data ? data.length : 0,
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.auditLog = auditLog;
exports.corsOptions = {
    origin: (origin, callback) => {
        if (config_1.config.NODE_ENV === 'development') {
            return callback(null, true);
        }
        const allowedOrigins = [config_1.config.FRONTEND_URL];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_1.logger.warn('CORS blocked request from origin:', origin);
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
};
