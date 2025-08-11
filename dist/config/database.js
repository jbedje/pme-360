"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.cleanupDatabase = exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient({
    log: [
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ],
    errorFormat: 'colorless',
});
exports.prisma = prisma;
prisma.$on('info', (e) => {
    logger_1.logger.info(`Prisma Info: ${e.message}`);
});
prisma.$on('warn', (e) => {
    logger_1.logger.warn(`Prisma Warning: ${e.message}`);
});
prisma.$on('error', (e) => {
    logger_1.logger.error(`Prisma Error: ${e.message}`);
});
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger_1.logger.info('✅ Database connected successfully');
        await prisma.$queryRaw `SELECT 1`;
        logger_1.logger.info('✅ Database connection test passed');
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger_1.logger.info('✅ Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Database disconnection failed:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
const cleanupDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
        await prisma.userActivity.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.eventRegistration.deleteMany();
        await prisma.event.deleteMany();
        await prisma.resource.deleteMany();
        await prisma.application.deleteMany();
        await prisma.opportunity.deleteMany();
        await prisma.message.deleteMany();
        await prisma.conversationParticipant.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.connection.deleteMany();
        await prisma.userExpertise.deleteMany();
        await prisma.user.deleteMany();
        logger_1.logger.info('✅ Test database cleaned');
    }
};
exports.cleanupDatabase = cleanupDatabase;
exports.default = prisma;
