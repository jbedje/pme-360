"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const simple_auth_1 = require("./services/simple-auth");
const simple_jwt_1 = require("./utils/simple-jwt");
const users_1 = require("./services/users");
const simple_messaging_1 = require("./services/simple-messaging");
const opportunities_1 = require("./services/opportunities");
const resources_1 = require("./services/resources");
const events_1 = require("./services/events");
const notifications_1 = require("./services/notifications");
const websocket_1 = require("./services/websocket");
const file_upload_1 = require("./services/file-upload");
const analytics_1 = require("./services/analytics");
const monitoring_1 = require("./services/monitoring");
const audit_1 = require("./services/audit");
const security_1 = require("./middleware/security");
const validation_1 = require("./middleware/validation");
const schemas_1 = require("./validation/schemas");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = 3000;
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
app.use(security_1.securityHeaders);
app.use(security_1.compressionMiddleware);
app.use((0, cors_1.default)(security_1.corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(security_1.ipBlacklist);
app.use(security_1.botDetection);
app.use(security_1.attackDetection);
app.use(validation_1.sanitizeInput);
app.use(security_1.speedLimiter);
app.use(security_1.auditLog);
app.use(monitoring_1.MonitoringService.requestMetricsMiddleware());
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token requis',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                error: 'Token invalide',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req.user = {
            id: payload.userId,
            email: payload.email,
            profileType: payload.profileType,
            verified: payload.verified,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token invalide',
            timestamp: new Date().toISOString(),
        });
    }
};
app.get('/health', async (req, res) => {
    try {
        const healthStatus = await monitoring_1.MonitoringService.getHealthStatus();
        const statusCode = healthStatus.status === 'healthy' ? 200 :
            healthStatus.status === 'degraded' ? 207 : 503;
        res.status(statusCode).json(healthStatus);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.get('/api/v1/monitoring/dashboard', security_1.generalRateLimit, authenticateToken, (0, validation_1.validatePermissions)(['admin']), async (req, res) => {
    try {
        const [healthStatus, dbMetrics, alerts] = await Promise.all([
            monitoring_1.MonitoringService.getHealthStatus(),
            monitoring_1.MonitoringService.getDatabaseMetrics(),
            monitoring_1.MonitoringService.checkAlerts()
        ]);
        res.json({
            success: true,
            data: {
                health: healthStatus,
                database: dbMetrics,
                alerts: alerts,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.get('/api/v1/test-db', security_1.generalRateLimit, async (req, res) => {
    try {
        await audit_1.AuditService.logSecurityEvent(audit_1.AuditActions.SUSPICIOUS_ACTIVITY, 'Database test endpoint accessed', req.ip, req.get('User-Agent'));
        await prisma.$connect();
        const userCount = await prisma.user.count();
        res.json({
            success: true,
            message: 'Database connection successful',
            stats: { totalUsers: userCount },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.post('/api/v1/auth/register', security_1.authRateLimit, (0, validation_1.validate)({ body: schemas_1.registerSchema }), async (req, res) => {
    try {
        const registrationData = req.body;
        const result = await simple_auth_1.SimpleAuthService.register(registrationData);
        await audit_1.AuditService.logAuthentication(audit_1.AuditActions.REGISTER, result.user.id, true, req.ip, req.get('User-Agent'));
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        await audit_1.AuditService.logAuthentication(audit_1.AuditActions.REGISTER, 'unknown', false, req.ip, req.get('User-Agent'), error.message);
        res.status(400).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.post('/api/v1/auth/login', security_1.authRateLimit, (0, validation_1.validate)({ body: schemas_1.loginSchema }), async (req, res) => {
    try {
        const loginData = req.body;
        const result = await simple_auth_1.SimpleAuthService.login(loginData);
        await audit_1.AuditService.logAuthentication(audit_1.AuditActions.LOGIN, result.user.id, true, req.ip, req.get('User-Agent'));
        res.json({
            success: true,
            message: 'Connexion réussie',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        await audit_1.AuditService.logAuthentication(audit_1.AuditActions.LOGIN, 'unknown', false, req.ip, req.get('User-Agent'), error.message);
        res.status(401).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.get('/api/v1/auth/profile', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const user = await simple_auth_1.SimpleAuthService.getUserById(req.user.id);
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
app.put('/api/v1/users/me', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
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
        const updatedUser = await users_1.UsersService.updateUser(req.user.id, filteredData);
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
app.post('/api/v1/messages', security_1.messageRateLimit, authenticateToken, (0, validation_1.validate)({ body: schemas_1.sendMessageSchema }), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const messageData = req.body;
        const message = await simple_messaging_1.SimpleMessagingService.sendMessage(req.user.id, messageData);
        await audit_1.AuditService.logResourceAction(audit_1.AuditActions.MESSAGE_SEND, req.user.id, 'MESSAGE', message.id, { recipientId: messageData.recipientId, type: messageData.type }, req.ip, req.get('User-Agent'));
        res.status(201).json({
            success: true,
            message: 'Message envoyé avec succès',
            data: message,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/messages/received', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '10', type, status, search, } = req.query;
        const filters = { type: type, status: status, search: search };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await simple_messaging_1.SimpleMessagingService.getMessages(req.user.id, filters, pagination, 'received');
        res.json({
            success: true,
            data: result.messages,
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
app.get('/api/v1/messages/sent', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '10', type, status, search, } = req.query;
        const filters = { type: type, status: status, search: search };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await simple_messaging_1.SimpleMessagingService.getMessages(req.user.id, filters, pagination, 'sent');
        res.json({
            success: true,
            data: result.messages,
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
app.get('/api/v1/messages/conversations', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '20', } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await simple_messaging_1.SimpleMessagingService.getConversations(req.user.id, pagination);
        res.json({
            success: true,
            data: result.conversations,
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
app.get('/api/v1/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { messageId } = req.params;
        const message = await simple_messaging_1.SimpleMessagingService.getMessageById(messageId, req.user.id);
        res.json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        if (error.message === 'Message non trouvé') {
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
app.put('/api/v1/messages/:messageId/read', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { messageId } = req.params;
        const message = await simple_messaging_1.SimpleMessagingService.markAsRead(messageId, req.user.id);
        res.json({
            success: true,
            message: 'Message marqué comme lu',
            data: message,
        });
    }
    catch (error) {
        if (error.message === 'Message non trouvé') {
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
app.delete('/api/v1/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { messageId } = req.params;
        const result = await simple_messaging_1.SimpleMessagingService.deleteMessage(messageId, req.user.id);
        res.json({
            success: true,
            message: 'Message supprimé avec succès',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Message non trouvé') {
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
app.get('/api/v1/messages/unread/count', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const result = await simple_messaging_1.SimpleMessagingService.getUnreadCount(req.user.id);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.post('/api/v1/opportunities', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { title, description, type, budget, amount, location, remote, deadline, startDate, skills, experience } = req.body;
        if (!title || !description || !type) {
            res.status(400).json({
                success: false,
                error: 'Titre, description et type sont requis',
            });
            return;
        }
        const opportunity = await opportunities_1.OpportunitiesService.createOpportunity(req.user.id, {
            title, description, type, budget, amount, location, remote,
            deadline: deadline ? new Date(deadline) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            skills, experience
        });
        res.status(201).json({
            success: true,
            message: 'Opportunité créée avec succès',
            data: opportunity,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/opportunities', async (req, res) => {
    try {
        const { page = '1', limit = '10', type, status, location, remote, skills, search, authorId, } = req.query;
        const filters = {
            type: type,
            status: status,
            location: location,
            remote: remote === 'true' ? true : remote === 'false' ? false : undefined,
            skills: skills,
            search: search,
            authorId: authorId,
        };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await opportunities_1.OpportunitiesService.getOpportunities(filters, pagination);
        res.json({
            success: true,
            data: result.opportunities,
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
app.get('/api/v1/opportunities/:opportunityId', async (req, res) => {
    try {
        const { opportunityId } = req.params;
        let userId;
        if (req.headers.authorization) {
            const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(req.headers.authorization);
            if (token) {
                const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
                userId = payload?.userId;
            }
        }
        const opportunity = await opportunities_1.OpportunitiesService.getOpportunityById(opportunityId, userId);
        res.json({
            success: true,
            data: opportunity,
        });
    }
    catch (error) {
        if (error.message === 'Opportunité non trouvée') {
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
app.put('/api/v1/opportunities/:opportunityId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { opportunityId } = req.params;
        const updateData = req.body;
        if (updateData.deadline)
            updateData.deadline = new Date(updateData.deadline);
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        const opportunity = await opportunities_1.OpportunitiesService.updateOpportunity(opportunityId, req.user.id, updateData);
        res.json({
            success: true,
            message: 'Opportunité mise à jour avec succès',
            data: opportunity,
        });
    }
    catch (error) {
        if (error.message === 'Opportunité non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à modifier cette opportunité') {
            res.status(403).json({
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
app.delete('/api/v1/opportunities/:opportunityId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { opportunityId } = req.params;
        const result = await opportunities_1.OpportunitiesService.deleteOpportunity(opportunityId, req.user.id);
        res.json({
            success: true,
            message: 'Opportunité supprimée avec succès',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Opportunité non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à supprimer cette opportunité') {
            res.status(403).json({
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
app.post('/api/v1/opportunities/:opportunityId/apply', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { opportunityId } = req.params;
        const { coverLetter, proposedRate, availability } = req.body;
        if (!coverLetter) {
            res.status(400).json({
                success: false,
                error: 'Lettre de motivation requise',
            });
            return;
        }
        const application = await opportunities_1.OpportunitiesService.applyToOpportunity(opportunityId, req.user.id, {
            coverLetter, proposedRate, availability
        });
        res.status(201).json({
            success: true,
            message: 'Candidature envoyée avec succès',
            data: application,
        });
    }
    catch (error) {
        if (error.message === 'Opportunité non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message.includes('déjà postulé') || error.message.includes('propre opportunité') || error.message.includes('plus active')) {
            res.status(400).json({
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
app.get('/api/v1/opportunities/:opportunityId/applications', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { opportunityId } = req.params;
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await opportunities_1.OpportunitiesService.getApplications(opportunityId, req.user.id, pagination);
        res.json({
            success: true,
            data: result.applications,
            meta: result.meta,
        });
    }
    catch (error) {
        if (error.message === 'Opportunité non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à voir les candidatures') {
            res.status(403).json({
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
app.get('/api/v1/applications/my', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await opportunities_1.OpportunitiesService.getUserApplications(req.user.id, pagination);
        res.json({
            success: true,
            data: result.applications,
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
app.post('/api/v1/resources', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { title, description, content, url, thumbnail, type, author, tags, isPremium } = req.body;
        if (!title || !description || !type || !author) {
            res.status(400).json({
                success: false,
                error: 'Titre, description, type et auteur sont requis',
            });
            return;
        }
        const user = await users_1.UsersService.getUserById(req.user.id);
        const resource = await resources_1.ResourcesService.createResource({
            title, description, content, url, thumbnail, type, author: author || user.name, tags, isPremium
        });
        res.status(201).json({
            success: true,
            message: 'Ressource créée avec succès',
            data: resource,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/resources', async (req, res) => {
    try {
        const { page = '1', limit = '10', type, status, category, search, authorId, tags, } = req.query;
        const filters = {
            type: type,
            author: authorId,
            search: search,
            tags: tags,
            isPremium: category === 'premium' ? true : category === 'free' ? false : undefined,
        };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await resources_1.ResourcesService.getResources(filters, pagination);
        res.json({
            success: true,
            data: result.resources,
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
app.get('/api/v1/resources/:resourceId', async (req, res) => {
    try {
        const { resourceId } = req.params;
        let userId;
        if (req.headers.authorization) {
            const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(req.headers.authorization);
            if (token) {
                const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
                userId = payload?.userId;
            }
        }
        const resource = await resources_1.ResourcesService.getResourceById(resourceId, userId ? true : false);
        res.json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        if (error.message === 'Ressource non trouvée') {
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
app.put('/api/v1/resources/:resourceId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { resourceId } = req.params;
        const updateData = req.body;
        const user = await users_1.UsersService.getUserById(req.user.id);
        const resource = await resources_1.ResourcesService.updateResource(resourceId, user.name, updateData);
        res.json({
            success: true,
            message: 'Ressource mise à jour avec succès',
            data: resource,
        });
    }
    catch (error) {
        if (error.message === 'Ressource non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à modifier cette ressource') {
            res.status(403).json({
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
app.delete('/api/v1/resources/:resourceId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { resourceId } = req.params;
        const user = await users_1.UsersService.getUserById(req.user.id);
        const result = await resources_1.ResourcesService.deleteResource(resourceId, user.name);
        res.json({
            success: true,
            message: 'Ressource supprimée avec succès',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Ressource non trouvée') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à supprimer cette ressource') {
            res.status(403).json({
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
app.get('/api/v1/resources/author/:authorName', async (req, res) => {
    try {
        const { authorName } = req.params;
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await resources_1.ResourcesService.getResourcesByAuthor(authorName, pagination);
        res.json({
            success: true,
            data: result.resources,
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
app.get('/api/v1/resources/popular', async (req, res) => {
    try {
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await resources_1.ResourcesService.getPopularResources(pagination);
        res.json({
            success: true,
            data: result.resources,
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
app.post('/api/v1/events', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { title, description, type, startDate, endDate, location, isOnline, meetingUrl, maxAttendees, price, organizer, organizerContact } = req.body;
        if (!title || !description || !type || !startDate) {
            res.status(400).json({
                success: false,
                error: 'Titre, description, type et date de début sont requis',
            });
            return;
        }
        const user = await users_1.UsersService.getUserById(req.user.id);
        const event = await events_1.EventsService.createEvent({
            title, description, type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            location, isOnline, meetingUrl, maxAttendees, price,
            organizer: organizer || user.name,
            organizerContact
        });
        res.status(201).json({
            success: true,
            message: 'Événement créé avec succès',
            data: event,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/events', async (req, res) => {
    try {
        const { page = '1', limit = '10', type, status, isOnline, location, upcoming, search, organizerId, tags, } = req.query;
        const filters = {
            type: type,
            status: status,
            isOnline: isOnline === 'true' ? true : isOnline === 'false' ? false : undefined,
            location: location,
            upcoming: upcoming === 'true',
            search: search,
            organizer: organizerId,
        };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'startDate',
            sortOrder: 'asc',
        };
        const result = await events_1.EventsService.getEvents(filters, pagination);
        res.json({
            success: true,
            data: result.events,
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
app.get('/api/v1/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        let userId;
        if (req.headers.authorization) {
            const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(req.headers.authorization);
            if (token) {
                const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
                userId = payload?.userId;
            }
        }
        const event = await events_1.EventsService.getEventById(eventId, userId);
        res.json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        if (error.message === 'Événement non trouvé') {
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
app.put('/api/v1/events/:eventId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { eventId } = req.params;
        const updateData = req.body;
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        const user = await users_1.UsersService.getUserById(req.user.id);
        const event = await events_1.EventsService.updateEvent(eventId, user.name, updateData);
        res.json({
            success: true,
            message: 'Événement mis à jour avec succès',
            data: event,
        });
    }
    catch (error) {
        if (error.message === 'Événement non trouvé') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à modifier cet événement') {
            res.status(403).json({
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
app.delete('/api/v1/events/:eventId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { eventId } = req.params;
        const user = await users_1.UsersService.getUserById(req.user.id);
        const result = await events_1.EventsService.deleteEvent(eventId, user.name);
        res.json({
            success: true,
            message: 'Événement supprimé avec succès',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Événement non trouvé') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à supprimer cet événement') {
            res.status(403).json({
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
app.post('/api/v1/events/:eventId/register', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { eventId } = req.params;
        const registration = await events_1.EventsService.registerForEvent(eventId, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: registration,
        });
    }
    catch (error) {
        if (error.message === 'Événement non trouvé') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message.includes('déjà inscrit') || error.message.includes('complet') || error.message.includes('passé') || error.message.includes('propre événement') || error.message.includes('pas ouvertes')) {
            res.status(400).json({
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
app.delete('/api/v1/events/:eventId/register', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { eventId } = req.params;
        const result = await events_1.EventsService.unregisterFromEvent(eventId, req.user.id);
        res.json({
            success: true,
            message: 'Désinscription réussie',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Inscription non trouvée') {
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
app.get('/api/v1/events/:eventId/registrations', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { eventId } = req.params;
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const user = await users_1.UsersService.getUserById(req.user.id);
        const result = await events_1.EventsService.getEventRegistrations(eventId, user.name, pagination);
        res.json({
            success: true,
            data: result.registrations,
            meta: result.meta,
        });
    }
    catch (error) {
        if (error.message === 'Événement non trouvé') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        else if (error.message === 'Non autorisé à voir les inscriptions') {
            res.status(403).json({
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
app.get('/api/v1/events/registrations/my', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '10' } = req.query;
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
        };
        const result = await events_1.EventsService.getUserRegistrations(req.user.id, pagination);
        res.json({
            success: true,
            data: result.registrations,
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
app.post('/api/v1/upload/avatar', security_1.uploadRateLimit, authenticateToken, upload.single('avatar'), (0, validation_1.validateFileUpload)(['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024, true), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'Aucun fichier fourni',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const uploadResult = await file_upload_1.FileUploadService.uploadFile(req.file, file_upload_1.FileType.AVATAR, req.user.id);
        await audit_1.AuditService.logResourceAction(audit_1.AuditActions.FILE_UPLOAD, req.user.id, 'FILE', uploadResult.publicId, { fileType: 'avatar', fileSize: req.file.size }, req.ip, req.get('User-Agent'));
        await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: uploadResult.url },
        });
        res.json({
            success: true,
            message: 'Avatar mis à jour avec succès',
            data: {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                responsiveUrls: file_upload_1.FileUploadService.generateResponsiveUrls(uploadResult.publicId),
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.post('/api/v1/upload/resource-thumbnail', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const upload = file_upload_1.FileUploadService.createUploadMiddleware(file_upload_1.FileType.RESOURCE_THUMBNAIL);
        upload.single('thumbnail')(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: err.message,
                });
                return;
            }
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni',
                });
                return;
            }
            try {
                const hasQuota = await file_upload_1.FileUploadService.checkUserQuota(req.user.id, req.file.size);
                if (!hasQuota) {
                    res.status(413).json({
                        success: false,
                        error: 'Quota de stockage dépassé',
                    });
                    return;
                }
                if (!file_upload_1.FileUploadService.validateFileType(req.file)) {
                    res.status(400).json({
                        success: false,
                        error: 'Type de fichier non autorisé',
                    });
                    return;
                }
                const uploadResult = await file_upload_1.FileUploadService.uploadFile(req.file, file_upload_1.FileType.RESOURCE_THUMBNAIL, req.user.id);
                res.json({
                    success: true,
                    message: 'Thumbnail uploadé avec succès',
                    data: {
                        url: uploadResult.url,
                        publicId: uploadResult.publicId,
                        responsiveUrls: file_upload_1.FileUploadService.generateResponsiveUrls(uploadResult.publicId),
                    },
                });
            }
            catch (uploadError) {
                res.status(500).json({
                    success: false,
                    error: uploadError.message,
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.post('/api/v1/upload/message-attachment', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const upload = file_upload_1.FileUploadService.createUploadMiddleware(file_upload_1.FileType.MESSAGE_ATTACHMENT);
        upload.single('attachment')(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: err.message,
                });
                return;
            }
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni',
                });
                return;
            }
            try {
                const hasQuota = await file_upload_1.FileUploadService.checkUserQuota(req.user.id, req.file.size);
                if (!hasQuota) {
                    res.status(413).json({
                        success: false,
                        error: 'Quota de stockage dépassé',
                    });
                    return;
                }
                if (!file_upload_1.FileUploadService.validateFileType(req.file)) {
                    res.status(400).json({
                        success: false,
                        error: 'Type de fichier non autorisé',
                    });
                    return;
                }
                const uploadResult = await file_upload_1.FileUploadService.uploadFile(req.file, file_upload_1.FileType.MESSAGE_ATTACHMENT, req.user.id);
                res.json({
                    success: true,
                    message: 'Pièce jointe uploadée avec succès',
                    data: {
                        url: uploadResult.url,
                        publicId: uploadResult.publicId,
                        filename: req.file.originalname,
                        size: uploadResult.size,
                        format: uploadResult.format,
                    },
                });
            }
            catch (uploadError) {
                res.status(500).json({
                    success: false,
                    error: uploadError.message,
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.post('/api/v1/upload/event-image', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const upload = file_upload_1.FileUploadService.createUploadMiddleware(file_upload_1.FileType.EVENT_IMAGE);
        upload.single('image')(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: err.message,
                });
                return;
            }
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni',
                });
                return;
            }
            try {
                const hasQuota = await file_upload_1.FileUploadService.checkUserQuota(req.user.id, req.file.size);
                if (!hasQuota) {
                    res.status(413).json({
                        success: false,
                        error: 'Quota de stockage dépassé',
                    });
                    return;
                }
                if (!file_upload_1.FileUploadService.validateFileType(req.file)) {
                    res.status(400).json({
                        success: false,
                        error: 'Type de fichier non autorisé',
                    });
                    return;
                }
                const uploadResult = await file_upload_1.FileUploadService.uploadFile(req.file, file_upload_1.FileType.EVENT_IMAGE, req.user.id);
                res.json({
                    success: true,
                    message: 'Image d\'événement uploadée avec succès',
                    data: {
                        url: uploadResult.url,
                        publicId: uploadResult.publicId,
                        responsiveUrls: file_upload_1.FileUploadService.generateResponsiveUrls(uploadResult.publicId),
                    },
                });
            }
            catch (uploadError) {
                res.status(500).json({
                    success: false,
                    error: uploadError.message,
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.delete('/api/v1/upload/:publicId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { publicId } = req.params;
        if (!publicId.includes(req.user.id)) {
            res.status(403).json({
                success: false,
                error: 'Non autorisé à supprimer ce fichier',
            });
            return;
        }
        const deleted = await file_upload_1.FileUploadService.deleteFile(publicId);
        if (deleted) {
            res.json({
                success: true,
                message: 'Fichier supprimé avec succès',
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Fichier non trouvé ou déjà supprimé',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/upload/:publicId/info', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { publicId } = req.params;
        const fileInfo = await file_upload_1.FileUploadService.getFileInfo(publicId);
        res.json({
            success: true,
            data: fileInfo,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Fichier non trouvé',
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
app.get('/api/v1/notifications', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { page = '1', limit = '10', type, read, search, } = req.query;
        const filters = {
            type: type,
            read: read === 'true' ? true : read === 'false' ? false : undefined,
            search: search,
        };
        const pagination = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        };
        const result = await notifications_1.NotificationsService.getUserNotifications(req.user.id, filters, pagination);
        res.json({
            success: true,
            data: result.notifications,
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
app.put('/api/v1/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { notificationId } = req.params;
        const notification = await notifications_1.NotificationsService.markAsRead(notificationId, req.user.id);
        res.json({
            success: true,
            message: 'Notification marquée comme lue',
            data: notification,
        });
    }
    catch (error) {
        if (error.message === 'Notification non trouvée') {
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
app.put('/api/v1/notifications/read-all', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const result = await notifications_1.NotificationsService.markAllAsRead(req.user.id);
        res.json({
            success: true,
            message: `${result.count} notifications marquées comme lues`,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.delete('/api/v1/notifications/:notificationId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { notificationId } = req.params;
        const result = await notifications_1.NotificationsService.deleteNotification(notificationId, req.user.id);
        res.json({
            success: true,
            message: 'Notification supprimée avec succès',
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Notification non trouvée') {
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
app.get('/api/v1/notifications/unread/count', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const result = await notifications_1.NotificationsService.getUnreadCount(req.user.id);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/platform', security_1.analyticsRateLimit, authenticateToken, (0, validation_1.validatePermissions)(['admin']), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const stats = await analytics_1.AnalyticsService.getPlatformStats();
        await audit_1.AuditService.logResourceAction(audit_1.AuditActions.ADMIN_ACTION, req.user.id, 'ANALYTICS', 'platform-stats', { action: 'view_platform_statistics' }, req.ip, req.get('User-Agent'));
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/user/:userId', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { userId } = req.params;
        const { period = 'month' } = req.query;
        const currentUser = await users_1.UsersService.getUserById(req.user.id);
        if (userId !== req.user.id && currentUser.profileType !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Accès interdit - Vous ne pouvez voir que vos propres métriques',
            });
            return;
        }
        const metrics = await analytics_1.AnalyticsService.getUserActivityMetrics(userId, period);
        res.json({
            success: true,
            data: metrics,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/my-activity', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const { period = 'month' } = req.query;
        const metrics = await analytics_1.AnalyticsService.getUserActivityMetrics(req.user.id, period);
        res.json({
            success: true,
            data: metrics,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/engagement', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const user = await users_1.UsersService.getUserById(req.user.id);
        if (user.profileType !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Accès interdit - Admin requis',
            });
            return;
        }
        const metrics = await analytics_1.AnalyticsService.getEngagementMetrics();
        res.json({
            success: true,
            data: metrics,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/trends', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const user = await users_1.UsersService.getUserById(req.user.id);
        if (user.profileType !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Accès interdit - Admin requis',
            });
            return;
        }
        const { days = '30' } = req.query;
        const daysInt = Math.min(Math.max(parseInt(days), 1), 365);
        const trends = await analytics_1.AnalyticsService.getTimeTrends(daysInt);
        res.json({
            success: true,
            data: trends,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
app.get('/api/v1/analytics/usage', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié',
            });
            return;
        }
        const user = await users_1.UsersService.getUserById(req.user.id);
        if (user.profileType !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Accès interdit - Admin requis',
            });
            return;
        }
        const usage = await analytics_1.AnalyticsService.getUsageStatistics();
        res.json({
            success: true,
            data: usage,
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
            'POST /api/v1/messages': 'Send message',
            'GET /api/v1/messages/received': 'Get received messages',
            'GET /api/v1/messages/sent': 'Get sent messages',
            'GET /api/v1/messages/conversations': 'Get conversations',
            'GET /api/v1/messages/:id': 'Get message by ID',
            'PUT /api/v1/messages/:id/read': 'Mark as read',
            'DELETE /api/v1/messages/:id': 'Delete message',
            'GET /api/v1/messages/unread/count': 'Get unread count',
            'POST /api/v1/opportunities': 'Create opportunity',
            'GET /api/v1/opportunities': 'List opportunities',
            'GET /api/v1/opportunities/:id': 'Get opportunity by ID',
            'PUT /api/v1/opportunities/:id': 'Update opportunity',
            'DELETE /api/v1/opportunities/:id': 'Delete opportunity',
            'POST /api/v1/opportunities/:id/apply': 'Apply to opportunity',
            'GET /api/v1/opportunities/:id/applications': 'Get applications',
            'GET /api/v1/applications/my': 'Get my applications',
            'POST /api/v1/resources': 'Create resource',
            'GET /api/v1/resources': 'List resources',
            'GET /api/v1/resources/:id': 'Get resource by ID',
            'PUT /api/v1/resources/:id': 'Update resource',
            'DELETE /api/v1/resources/:id': 'Delete resource',
            'POST /api/v1/resources/:id/favorite': 'Toggle favorite',
            'GET /api/v1/resources/favorites/my': 'Get my favorites',
            'POST /api/v1/events': 'Create event',
            'GET /api/v1/events': 'List events',
            'GET /api/v1/events/:id': 'Get event by ID',
            'PUT /api/v1/events/:id': 'Update event',
            'DELETE /api/v1/events/:id': 'Delete event',
            'POST /api/v1/events/:id/register': 'Register for event',
            'DELETE /api/v1/events/:id/register': 'Unregister from event',
            'GET /api/v1/events/:id/registrations': 'Get event registrations',
            'GET /api/v1/events/registrations/my': 'Get my registrations',
            'GET /api/v1/notifications': 'Get user notifications',
            'PUT /api/v1/notifications/:id/read': 'Mark notification as read',
            'PUT /api/v1/notifications/read-all': 'Mark all as read',
            'DELETE /api/v1/notifications/:id': 'Delete notification',
            'GET /api/v1/notifications/unread/count': 'Get unread count',
            'POST /api/v1/upload/avatar': 'Upload user avatar',
            'POST /api/v1/upload/resource-thumbnail': 'Upload resource thumbnail',
            'POST /api/v1/upload/message-attachment': 'Upload message attachment',
            'POST /api/v1/upload/event-image': 'Upload event image',
            'DELETE /api/v1/upload/:publicId': 'Delete file',
            'GET /api/v1/upload/:publicId/info': 'Get file info',
            'GET /api/v1/analytics/platform': 'Get platform statistics (Admin)',
            'GET /api/v1/analytics/user/:userId': 'Get user activity metrics',
            'GET /api/v1/analytics/my-activity': 'Get my activity metrics',
            'GET /api/v1/analytics/engagement': 'Get engagement metrics (Admin)',
            'GET /api/v1/analytics/trends': 'Get time trends (Admin)',
            'GET /api/v1/analytics/usage': 'Get usage statistics (Admin)',
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
        const server = app.listen(PORT, () => {
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
            console.log('   POST /api/v1/messages');
            console.log('   GET  /api/v1/messages/received');
            console.log('   GET  /api/v1/messages/sent');
            console.log('   GET  /api/v1/messages/conversations');
            console.log('   GET  /api/v1/messages/:id');
            console.log('   PUT  /api/v1/messages/:id/read');
            console.log('   DEL  /api/v1/messages/:id');
            console.log('   GET  /api/v1/messages/unread/count');
            console.log('   POST /api/v1/opportunities');
            console.log('   GET  /api/v1/opportunities');
            console.log('   GET  /api/v1/opportunities/:id');
            console.log('   PUT  /api/v1/opportunities/:id');
            console.log('   DEL  /api/v1/opportunities/:id');
            console.log('   POST /api/v1/opportunities/:id/apply');
            console.log('   GET  /api/v1/opportunities/:id/applications');
            console.log('   GET  /api/v1/applications/my');
            console.log('   POST /api/v1/resources');
            console.log('   GET  /api/v1/resources');
            console.log('   GET  /api/v1/resources/:id');
            console.log('   PUT  /api/v1/resources/:id');
            console.log('   DEL  /api/v1/resources/:id');
            console.log('   POST /api/v1/resources/:id/favorite');
            console.log('   GET  /api/v1/resources/favorites/my');
            console.log('   POST /api/v1/events');
            console.log('   GET  /api/v1/events');
            console.log('   GET  /api/v1/events/:id');
            console.log('   PUT  /api/v1/events/:id');
            console.log('   DEL  /api/v1/events/:id');
            console.log('   POST /api/v1/events/:id/register');
            console.log('   DEL  /api/v1/events/:id/register');
            console.log('   GET  /api/v1/events/:id/registrations');
            console.log('   GET  /api/v1/events/registrations/my');
            console.log('   GET  /api/v1/notifications');
            console.log('   PUT  /api/v1/notifications/:id/read');
            console.log('   PUT  /api/v1/notifications/read-all');
            console.log('   DEL  /api/v1/notifications/:id');
            console.log('   GET  /api/v1/notifications/unread/count');
            console.log('   POST /api/v1/upload/avatar');
            console.log('   POST /api/v1/upload/resource-thumbnail');
            console.log('   POST /api/v1/upload/message-attachment');
            console.log('   POST /api/v1/upload/event-image');
            console.log('   DEL  /api/v1/upload/:publicId');
            console.log('   GET  /api/v1/upload/:publicId/info');
            console.log('   GET  /api/v1/analytics/platform');
            console.log('   GET  /api/v1/analytics/user/:userId');
            console.log('   GET  /api/v1/analytics/my-activity');
            console.log('   GET  /api/v1/analytics/engagement');
            console.log('   GET  /api/v1/analytics/trends');
            console.log('   GET  /api/v1/analytics/usage');
            console.log('===============================');
        });
        const wsService = new websocket_1.WebSocketNotificationService(server);
        global.wsService = wsService;
    }
    catch (error) {
        console.error('❌ Server start failed:', error);
        process.exit(1);
    }
}
startServer();
