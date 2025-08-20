"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3002'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP'
});
app.use('/api', limiter);
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1),
    profileType: zod_1.z.enum(['PME', 'STARTUP', 'EXPERT', 'MENTOR', 'INCUBATOR', 'INVESTOR', 'FINANCIAL_INSTITUTION', 'PUBLIC_ORGANIZATION', 'TECH_PARTNER', 'CONSULTANT']),
    company: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    phone: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
// JWT utilities
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};
const verifyToken = (token, secret = JWT_SECRET) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch {
        return null;
    }
};
// Auth middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user || user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'User not found or inactive' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Authentication error' });
    }
};
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                profileType: validatedData.profileType,
                company: validatedData.company,
                location: validatedData.location,
                description: validatedData.description,
                website: validatedData.website,
                phone: validatedData.phone,
                status: 'ACTIVE',
                verified: false
            }
        });
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);
        // Return user data
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            profileType: user.profileType,
            company: user.company,
            location: user.location,
            description: user.description,
            website: user.website,
            phone: user.phone,
            verified: user.verified,
            status: user.status,
            completionScore: user.completionScore,
            rating: user.rating,
            reviewCount: user.reviewCount,
            createdAt: user.createdAt.toISOString()
        };
        res.status(201).json({
            success: true,
            data: {
                user: userData,
                token: accessToken,
                refreshToken,
                expiresIn: 24 * 60 * 60 // 24 hours in seconds
            },
            message: 'Account created successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: error.errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating account'
        });
    }
});
// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });
        if (!user || user.status !== 'ACTIVE') {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);
        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // Return user data
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            profileType: user.profileType,
            company: user.company,
            location: user.location,
            description: user.description,
            website: user.website,
            phone: user.phone,
            verified: user.verified,
            status: user.status,
            completionScore: user.completionScore,
            rating: user.rating,
            reviewCount: user.reviewCount,
            createdAt: user.createdAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString()
        };
        res.json({
            success: true,
            data: {
                user: userData,
                token: accessToken,
                refreshToken,
                expiresIn: 24 * 60 * 60 // 24 hours in seconds
            },
            message: 'Connexion réussie'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: error.errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur de connexion'
        });
    }
});
// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }
        const decoded = verifyToken(refreshToken, JWT_REFRESH_SECRET);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user || user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Invalid user'
            });
        }
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profileType: user.profileType,
                    company: user.company,
                    location: user.location,
                    description: user.description,
                    website: user.website,
                    phone: user.phone,
                    verified: user.verified,
                    status: user.status,
                    completionScore: user.completionScore,
                    rating: user.rating,
                    reviewCount: user.reviewCount,
                    createdAt: user.createdAt.toISOString(),
                    lastLogin: user.lastLogin?.toISOString()
                },
                token: accessToken,
                refreshToken: newRefreshToken,
                expiresIn: 24 * 60 * 60
            }
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token'
        });
    }
});
// Get profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            profileType: user.profileType,
            company: user.company,
            location: user.location,
            description: user.description,
            website: user.website,
            phone: user.phone,
            verified: user.verified,
            status: user.status,
            completionScore: user.completionScore,
            rating: user.rating,
            reviewCount: user.reviewCount,
            createdAt: user.createdAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString()
        };
        res.json({
            success: true,
            data: userData
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});
// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 PME 360 API Server running on port ${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🔑 Auth endpoints available at: http://localhost:${PORT}/api/auth/*`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        prisma.$disconnect();
        process.exit(0);
    });
});
exports.default = app;
