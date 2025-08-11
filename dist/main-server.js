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
const client_1 = require("@prisma/client");
const simple_auth_1 = __importDefault(require("./routes/simple-auth"));
const simple_users_1 = __importDefault(require("./routes/simple-users"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 3003;
const API_PREFIX = '/api/v1';
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3001',
    ],
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
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
app.set('trust proxy', 1);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'PME 360 Backend API is running',
        timestamp: new Date().toISOString(),
        environment: 'development',
        uptime: process.uptime(),
    });
});
app.get(API_PREFIX, (req, res) => {
    res.json({
        message: 'PME 360 API v1',
        version: '1.0.0',
        status: 'active',
        documentation: 'https://api.pme360.com/docs',
        endpoints: {
            auth: `${API_PREFIX}/auth`,
            users: `${API_PREFIX}/users`,
            health: '/health',
        },
    });
});
app.use(`${API_PREFIX}/auth`, simple_auth_1.default);
app.use(`${API_PREFIX}/users`, simple_users_1.default);
app.get(`${API_PREFIX}/test-db`, async (req, res) => {
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();
        res.json({
            success: true,
            message: 'Database connection successful',
            stats: {
                totalUsers: userCount,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.use('*', (req, res) => {
    console.log(`🔍 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
        availableEndpoints: {
            health: 'GET /health',
            api: `GET ${API_PREFIX}`,
            auth: `${API_PREFIX}/auth/*`,
            users: `${API_PREFIX}/users/*`,
        },
        timestamp: new Date().toISOString(),
    });
});
app.use((error, req, res, next) => {
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Une erreur interne s\'est produite';
    console.error(`🚨 ${status} Error:`, {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });
    res.status(status).json({
        success: false,
        error: message,
        status,
        timestamp: new Date().toISOString(),
    });
});
async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        const server = app.listen(PORT, () => {
            console.log('🚀 PME 360 Backend API Server Started');
            console.log('=====================================');
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 Environment: development`);
            console.log(`📡 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
            console.log('');
            console.log('📋 Available Endpoints:');
            console.log(`   POST ${API_PREFIX}/auth/register - User registration`);
            console.log(`   POST ${API_PREFIX}/auth/login - User login`);
            console.log(`   GET  ${API_PREFIX}/auth/profile - Get user profile`);
            console.log(`   GET  ${API_PREFIX}/users - List users`);
            console.log(`   GET  ${API_PREFIX}/users/:id - Get user by ID`);
            console.log(`   PUT  ${API_PREFIX}/users/me - Update own profile`);
            console.log('=====================================');
        });
        const gracefulShutdown = (signal) => {
            console.log(`\n🛑 ${signal} received, shutting down gracefully`);
            server.close(async () => {
                console.log('✅ HTTP server closed');
                await prisma.$disconnect();
                console.log('✅ Database disconnected');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('❌ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
