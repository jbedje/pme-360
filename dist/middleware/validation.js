"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePermissions = exports.sanitizeInput = exports.validateFileUpload = exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
const validate = (schemas) => {
    return async (req, res, next) => {
        const errors = [];
        try {
            if (schemas.body) {
                try {
                    req.body = await schemas.body.parseAsync(req.body);
                }
                catch (error) {
                    if (error instanceof zod_1.z.ZodError) {
                        errors.push(...formatZodErrors(error, 'body'));
                    }
                }
            }
            if (schemas.query) {
                try {
                    req.query = await schemas.query.parseAsync(req.query);
                }
                catch (error) {
                    if (error instanceof zod_1.z.ZodError) {
                        errors.push(...formatZodErrors(error, 'query'));
                    }
                }
            }
            if (schemas.params) {
                try {
                    req.params = await schemas.params.parseAsync(req.params);
                }
                catch (error) {
                    if (error instanceof zod_1.z.ZodError) {
                        errors.push(...formatZodErrors(error, 'params'));
                    }
                }
            }
            if (errors.length > 0) {
                logger_1.logger.warn('Validation errors:', {
                    url: req.originalUrl,
                    method: req.method,
                    errors,
                    ip: req.ip,
                });
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: errors,
                    timestamp: new Date().toISOString(),
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur de validation interne',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validate = validate;
const formatZodErrors = (error, source) => {
    return error.errors.map(err => ({
        field: `${source}.${err.path.join('.')}`,
        message: err.message,
        code: err.code,
        received: err.received,
    }));
};
const validateFileUpload = (allowedTypes, maxSize, required = true) => {
    return (req, res, next) => {
        try {
            if (required && !req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Fichier requis',
                    timestamp: new Date().toISOString(),
                });
            }
            if (!req.file && !required) {
                return next();
            }
            const file = req.file;
            if (!allowedTypes.includes(file.mimetype)) {
                logger_1.logger.warn('Invalid file type uploaded:', {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    allowedTypes,
                    ip: req.ip,
                });
                return res.status(400).json({
                    success: false,
                    error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`,
                    timestamp: new Date().toISOString(),
                });
            }
            if (file.size > maxSize) {
                logger_1.logger.warn('File too large uploaded:', {
                    filename: file.originalname,
                    size: file.size,
                    maxSize,
                    ip: req.ip,
                });
                return res.status(400).json({
                    success: false,
                    error: `Fichier trop volumineux. Taille maximum: ${Math.round(maxSize / 1024 / 1024)}MB`,
                    timestamp: new Date().toISOString(),
                });
            }
            if (!isValidFilename(file.originalname)) {
                return res.status(400).json({
                    success: false,
                    error: 'Nom de fichier invalide. Caractères autorisés: lettres, chiffres, tirets et points.',
                    timestamp: new Date().toISOString(),
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('File validation error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur de validation du fichier',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validateFileUpload = validateFileUpload;
const isValidFilename = (filename) => {
    const dangerousPatterns = [
        /\.\./g,
        /[<>:"/\\|?*]/g,
        /^\.+$/,
        /^\s*$/,
    ];
    return !dangerousPatterns.some(pattern => pattern.test(filename));
};
const sanitizeInput = (req, res, next) => {
    try {
        req.body = sanitizeObject(req.body);
        req.query = sanitizeObject(req.query);
        req.params = sanitizeObject(req.params);
        next();
    }
    catch (error) {
        logger_1.logger.error('Input sanitization error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur de sanitisation des données',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.sanitizeInput = sanitizeInput;
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    return obj;
};
const sanitizeString = (str) => {
    return str
        .trim()
        .replace(/\0/g, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .substring(0, 5000);
};
const validatePermissions = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentification requise',
                    timestamp: new Date().toISOString(),
                });
            }
            const hasPermission = requiredPermissions.every(permission => {
                switch (permission) {
                    case 'admin':
                        return user.profileType === 'ADMIN';
                    case 'verified':
                        return user.verified;
                    default:
                        return true;
                }
            });
            if (!hasPermission) {
                logger_1.logger.warn('Insufficient permissions:', {
                    userId: user.id,
                    requiredPermissions,
                    userType: user.profileType,
                    url: req.originalUrl,
                    ip: req.ip,
                });
                return res.status(403).json({
                    success: false,
                    error: 'Permissions insuffisantes',
                    timestamp: new Date().toISOString(),
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Permission validation error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur de validation des permissions',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validatePermissions = validatePermissions;
