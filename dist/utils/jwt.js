"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../config/logger");
class JWTService {
    static generateAccessToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign(payload, config_1.config.JWT_SECRET, {
                expiresIn: config_1.config.JWT_EXPIRES_IN,
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
            const token = jsonwebtoken_1.default.sign({ userId: payload.userId, email: payload.email }, config_1.config.JWT_REFRESH_SECRET, {
                expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN,
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
    static generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET, {
                issuer: 'pme360-api',
                audience: 'pme360-frontend',
            });
            logger_1.logger.debug(`✅ Access token verified for user: ${decoded.userId}`);
            return decoded;
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
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_REFRESH_SECRET, {
                issuer: 'pme360-api',
                audience: 'pme360-frontend',
            });
            logger_1.logger.debug(`✅ Refresh token verified for user: ${decoded.userId}`);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                logger_1.logger.debug('⏰ Refresh token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                logger_1.logger.debug('❌ Invalid refresh token');
            }
            else {
                logger_1.logger.error('❌ Error verifying refresh token:', error);
            }
            return null;
        }
    }
    static decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return decoded;
        }
        catch (error) {
            logger_1.logger.error('❌ Error decoding token:', error);
            return null;
        }
    }
    static isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp)
                return true;
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        catch (error) {
            return true;
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
        const tokens = this.generateTokenPair(payload);
        return {
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: config_1.config.JWT_EXPIRES_IN,
                tokenType: 'Bearer',
            },
        };
    }
}
exports.JWTService = JWTService;
