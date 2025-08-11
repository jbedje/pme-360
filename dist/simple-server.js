"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const simple_auth_1 = require("./services/simple-auth");
const simple_jwt_1 = require("./utils/simple-jwt");
const users_1 = require("./services/users");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PME 360 Backend is running',
        timestamp: new Date().toISOString(),
    });
});
app.get('/api/v1/test-db', async (req, res) => {
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();
        res.json({
            success: true,
            message: 'Database connection successful',
            stats: { totalUsers: userCount },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { name, email, password, profileType, company, location } = req.body;
        if (!name || !email || !password || !profileType) {
            res.status(400).json({
                success: false,
                error: 'Nom, email, mot de passe et type de profil sont requis',
            });
            return;
        }
        const result = await simple_auth_1.SimpleAuthService.register({
            name, email, password, profileType, company, location
        });
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email et mot de passe requis',
            });
            return;
        }
        const result = await simple_auth_1.SimpleAuthService.login({ email, password });
        res.json({
            success: true,
            message: 'Connexion réussie',
            data: result,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/auth/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token requis',
            });
            return;
        }
        const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                error: 'Token invalide',
            });
            return;
        }
        const user = await simple_auth_1.SimpleAuthService.getUserById(payload.userId);
        res.json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/users', async (req, res) => {
    try {
        const { page = '1', limit = '10', profileType, location, search, } = req.query;
        const filters = {
            profileType: profileType,
            location: location,
            search: search,
        };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await users_1.UsersService.getAllUsers(filters, pagination);
        res.json({
            success: true,
            data: result.users,
            meta: result.meta,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await users_1.UsersService.getUserById(userId);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        if (error.message === 'Utilisateur non trouvé') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
});
app.put('/api/v1/users/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token requis',
            });
            return;
        }
        const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                error: 'Token invalide',
            });
            return;
        }
        const updateData = req.body;
        const allowedFields = ['name', 'company', 'location', 'description', 'website', 'linkedin', 'phone'];
        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }
        const updatedUser = await users_1.UsersService.updateUser(payload.userId, filteredData);
        res.json({
            success: true,
            message: 'Profil mis à jour',
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1', (req, res) => {
    res.json({
        message: 'PME 360 API v1',
        version: '1.0.0',
        endpoints: {
            'POST /api/v1/auth/register': 'User registration',
            'POST /api/v1/auth/login': 'User login',
            'GET /api/v1/auth/profile': 'Get user profile',
            'GET /api/v1/users': 'List users',
            'GET /api/v1/users/:id': 'Get user by ID',
            'PUT /api/v1/users/me': 'Update profile',
        },
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} not found`,
    });
});
async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
        app.listen(PORT, () => {
            console.log('🚀 PME 360 API Server Started');
            console.log('===============================');
            console.log(`✅ Server: http://localhost:${PORT}`);
            console.log(`🔍 Health: http://localhost:${PORT}/health`);
            console.log(`📋 API Info: http://localhost:${PORT}/api/v1`);
            console.log('');
            console.log('📌 Available Endpoints:');
            console.log('   POST /api/v1/auth/register');
            console.log('   POST /api/v1/auth/login');
            console.log('   GET  /api/v1/auth/profile');
            console.log('   GET  /api/v1/users');
            console.log('   GET  /api/v1/users/:id');
            console.log('   PUT  /api/v1/users/me');
            console.log('===============================');
        });
    }
    catch (error) {
        console.error('❌ Server start failed:', error);
        process.exit(1);
    }
}
startServer();
