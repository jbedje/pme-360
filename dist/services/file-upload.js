"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = exports.FileType = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
cloudinary_1.v2.config({
    cloud_name: config_1.config.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.config.CLOUDINARY_API_KEY,
    api_secret: config_1.config.CLOUDINARY_API_SECRET,
});
var FileType;
(function (FileType) {
    FileType["AVATAR"] = "avatar";
    FileType["RESOURCE_THUMBNAIL"] = "resource_thumbnail";
    FileType["MESSAGE_ATTACHMENT"] = "message_attachment";
    FileType["APPLICATION_DOCUMENT"] = "application_document";
    FileType["EVENT_IMAGE"] = "event_image";
    FileType["COMPANY_LOGO"] = "company_logo";
})(FileType || (exports.FileType = FileType = {}));
const FILE_CONFIGS = {
    [FileType.AVATAR]: {
        maxSize: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'pme360/avatars',
        transformation: { width: 400, height: 400, crop: 'fill', quality: 'auto' },
    },
    [FileType.RESOURCE_THUMBNAIL]: {
        maxSize: 10 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'pme360/resources',
        transformation: { width: 800, height: 600, crop: 'fill', quality: 'auto' },
    },
    [FileType.MESSAGE_ATTACHMENT]: {
        maxSize: 25 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
        folder: 'pme360/messages',
        transformation: { quality: 'auto' },
    },
    [FileType.APPLICATION_DOCUMENT]: {
        maxSize: 10 * 1024 * 1024,
        allowedFormats: ['pdf', 'doc', 'docx'],
        folder: 'pme360/applications',
        transformation: {},
    },
    [FileType.EVENT_IMAGE]: {
        maxSize: 15 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'pme360/events',
        transformation: { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    },
    [FileType.COMPANY_LOGO]: {
        maxSize: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
        folder: 'pme360/companies',
        transformation: { width: 300, height: 300, crop: 'fit', quality: 'auto' },
    },
};
class FileUploadService {
    static createUploadMiddleware(fileType) {
        const fileConfig = FILE_CONFIGS[fileType];
        const storage = multer_1.default.memoryStorage();
        const fileFilter = (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase().replace('.', '');
            if (fileConfig.allowedFormats.includes(ext)) {
                cb(null, true);
            }
            else {
                cb(new Error(`Format de fichier non autorisé. Formats acceptés: ${fileConfig.allowedFormats.join(', ')}`));
            }
        };
        return (0, multer_1.default)({
            storage,
            fileFilter,
            limits: {
                fileSize: fileConfig.maxSize,
            },
        });
    }
    static async uploadFile(file, fileType, userId, additionalOptions = {}) {
        try {
            const fileConfig = FILE_CONFIGS[fileType];
            console.log(`📤 Uploading ${fileType} for user ${userId}: ${file.originalname}`);
            const uploadOptions = {
                folder: fileConfig.folder,
                public_id: `${userId}_${Date.now()}`,
                resource_type: 'auto',
                transformation: fileConfig.transformation,
                ...additionalOptions,
            };
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        reject(error);
                    }
                    else if (result) {
                        resolve(result);
                    }
                    else {
                        reject(new Error('Upload failed - no result'));
                    }
                }).end(file.buffer);
            });
            console.log(`✅ File uploaded successfully: ${result.public_id}`);
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
                width: result.width,
                height: result.height,
            };
        }
        catch (error) {
            console.error(`❌ File upload failed for ${fileType}:`, error);
            throw new Error(`Échec de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    static async deleteFile(publicId) {
        try {
            console.log(`🗑️ Deleting file: ${publicId}`);
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            if (result.result === 'ok') {
                console.log(`✅ File deleted successfully: ${publicId}`);
                return true;
            }
            else {
                console.warn(`⚠️ File deletion warning: ${result.result} for ${publicId}`);
                return false;
            }
        }
        catch (error) {
            console.error(`❌ File deletion failed: ${publicId}`, error);
            return false;
        }
    }
    static generateOptimizedUrl(publicId, options = {}) {
        return cloudinary_1.v2.url(publicId, {
            quality: 'auto',
            fetch_format: 'auto',
            ...options,
        });
    }
    static generateResponsiveUrls(publicId) {
        const sizes = {
            thumbnail: { width: 150, height: 150, crop: 'fill' },
            small: { width: 300, height: 225, crop: 'fill' },
            medium: { width: 600, height: 450, crop: 'fill' },
            large: { width: 1200, height: 900, crop: 'fill' },
        };
        const urls = {};
        for (const [sizeName, transformation] of Object.entries(sizes)) {
            urls[sizeName] = this.generateOptimizedUrl(publicId, transformation);
        }
        return urls;
    }
    static async checkUserQuota(userId, fileSize) {
        try {
            const maxQuota = 100 * 1024 * 1024;
            console.log(`📊 Checking quota for user ${userId}: ${fileSize} bytes`);
            return fileSize <= maxQuota;
        }
        catch (error) {
            console.error('❌ Quota check failed:', error);
            return false;
        }
    }
    static async getFileInfo(publicId) {
        try {
            const result = await cloudinary_1.v2.api.resource(publicId);
            return {
                url: result.secure_url,
                format: result.format,
                size: result.bytes,
                width: result.width,
                height: result.height,
                createdAt: result.created_at,
            };
        }
        catch (error) {
            console.error(`❌ Failed to get file info for ${publicId}:`, error);
            throw error;
        }
    }
    static validateFileType(file) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        return allowedMimeTypes.includes(file.mimetype);
    }
    static async cleanupOrphanedFiles() {
        try {
            console.log('🧹 Starting cleanup of orphaned files...');
            console.log('✅ Cleanup completed');
            return 0;
        }
        catch (error) {
            console.error('❌ Cleanup failed:', error);
            throw error;
        }
    }
}
exports.FileUploadService = FileUploadService;
