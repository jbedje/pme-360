"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleJWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../config/logger");
class SimpleJWTService {
    static generateAccessToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign({
                userId: payload.userId,
                email: payload.email,
                profileType: payload.profileType,
                verified: payload.verified,
            }, config_1.config.JWT_SECRET, {
                expiresIn: '24h',
                issuer: 'pme360-api',
                audience: 'pme360-frontend',
            });
            logger_1.logger.debug(`✅ Access token generated for user: ${payload.userId}`);
            return token;
        }
        catch (error) {
            logger_1.logger.error('❌ Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }
    static generateRefreshToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign({
                userId: payload.userId,
                email: payload.email,
            }, config_1.config.JWT_REFRESH_SECRET, {
                expiresIn: '7d',
                issuer: 'pme360-api',
                audience: 'pme360-frontend',
            });
            logger_1.logger.debug(`✅ Refresh token generated for user: ${payload.userId}`);
            return token;
        }
        catch (error) {
            logger_1.logger.error('❌ Error generating refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET, {
                issuer: 'pme360-api',
                audience: 'pme360-frontend',
            });
            logger_1.logger.debug(`✅ Access token verified for user: ${decoded.userId}`);
            return {
                userId: decoded.userId,
                email: decoded.email,
                profileType: decoded.profileType,
                verified: decoded.verified,
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                logger_1.logger.debug('⏰ Access token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                logger_1.logger.debug('❌ Invalid access token');
            }
            else {
                logger_1.logger.error('❌ Error verifying access token:', error);
            }
            return null;
        }
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    static generateAuthResponse(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return {
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: '24h',
                tokenType: 'Bearer',
            },
        };
    }
}
exports.SimpleJWTService = SimpleJWTService;
