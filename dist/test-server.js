"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PME 360 Backend Test Server is running',
        timestamp: new Date().toISOString(),
    });
});
app.get('/test-db', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({
            success: true,
            message: 'Database connection successful',
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
app.post('/test-user', async (req, res) => {
    try {
        const testUser = await prisma.user.create({
            data: {
                name: 'Utilisateur Test',
                email: `test-${Date.now()}@pme360.com`,
                password: 'hashedpassword123',
                profileType: 'STARTUP',
                company: 'Ma Startup',
                location: 'Paris, France',
            },
        });
        res.json({
            success: true,
            message: 'Test user created successfully',
            data: {
                id: testUser.id,
                name: testUser.name,
                email: testUser.email,
                profileType: testUser.profileType,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create test user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                profileType: true,
                company: true,
                location: true,
                verified: true,
                createdAt: true,
            },
            take: 10,
        });
        res.json({
            success: true,
            data: users,
            count: users.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.listen(PORT, () => {
    console.log(`✅ Test server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Test DB: http://localhost:${PORT}/test-db`);
    console.log(`👤 Create test user: POST http://localhost:${PORT}/test-user`);
    console.log(`📋 List users: http://localhost:${PORT}/users`);
});
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
