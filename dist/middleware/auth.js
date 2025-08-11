"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnership = exports.requireProfileType = exports.requireVerified = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const types_1 = require("../types");
const logger_1 = require("../config/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.JWTService.extractTokenFromHeader(authHeader);
        if (!token) {
            logger_1.logger.debug('🚫 No token provided');
            throw new types_1.UnauthorizedError('Token d\'accès requis');
        }
        const payload = jwt_1.JWTService.verifyAccessToken(token);
        if (!payload) {
            logger_1.logger.debug('🚫 Invalid or expired token');
            throw new types_1.UnauthorizedError('Token invalide ou expiré');
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
        if (error instanceof types_1.UnauthorizedError) {
            return next(error);
        }
        logger_1.logger.error('❌ Authentication middleware error:', error);
        next(new types_1.UnauthorizedError('Erreur d\'authentification'));
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.JWTService.extractTokenFromHeader(authHeader);
        if (token) {
            const payload = jwt_1.JWTService.verifyAccessToken(token);
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
const requireVerified = (req, res, next) => {
    if (!req.user) {
        return next(new types_1.UnauthorizedError('Authentication requise'));
    }
    if (!req.user.verified) {
        logger_1.logger.debug(`🚫 Unverified user attempted access: ${req.user.email}`);
        return next(new types_1.UnauthorizedError('Compte non vérifié'));
    }
    next();
};
exports.requireVerified = requireVerified;
const requireProfileType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new types_1.UnauthorizedError('Authentication requise'));
        }
        if (!allowedTypes.includes(req.user.profileType)) {
            logger_1.logger.debug(`🚫 Insufficient permissions for user: ${req.user.email}, type: ${req.user.profileType}`);
            return next(new types_1.UnauthorizedError('Type de profil non autorisé'));
        }
        next();
    };
};
exports.requireProfileType = requireProfileType;
const requireOwnership = (resourceUserId) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new types_1.UnauthorizedError('Authentication requise'));
        }
        if (req.user.id !== resourceUserId) {
            logger_1.logger.debug(`🚫 User ${req.user.email} attempted to access resource owned by ${resourceUserId}`);
            return next(new types_1.UnauthorizedError('Accès non autorisé à cette ressource'));
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
