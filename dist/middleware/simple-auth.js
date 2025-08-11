"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const simple_jwt_1 = require("../utils/simple-jwt");
const logger_1 = require("../config/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(authHeader);
        if (!token) {
            logger_1.logger.debug('🚫 No token provided');
            res.status(401).json({
                success: false,
                error: 'Token d\'accès requis',
            });
            return;
        }
        const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
        if (!payload) {
            logger_1.logger.debug('🚫 Invalid or expired token');
            res.status(401).json({
                success: false,
                error: 'Token invalide ou expiré',
            });
            return;
        }
        req.user = {
            id: payload.userId,
            email: payload.email,
            profileType: payload.profileType,
            verified: payload.verified,
        };
        logger_1.logger.debug(`✅ User authenticated: ${payload.email}`);
        next();
    }
    catch (error) {
        logger_1.logger.error('❌ Authentication middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Erreur d\'authentification',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = simple_jwt_1.SimpleJWTService.extractTokenFromHeader(authHeader);
        if (token) {
            const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
            if (payload) {
                req.user = {
                    id: payload.userId,
                    email: payload.email,
                    profileType: payload.profileType,
                    verified: payload.verified,
                };
                logger_1.logger.debug(`✅ Optional auth - User authenticated: ${payload.email}`);
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.debug('Optional auth failed, continuing without authentication');
        next();
    }
};
exports.optionalAuth = optionalAuth;
