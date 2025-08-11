import multer from 'multer';
export declare enum FileType {
    AVATAR = "avatar",
    RESOURCE_THUMBNAIL = "resource_thumbnail",
    MESSAGE_ATTACHMENT = "message_attachment",
    APPLICATION_DOCUMENT = "application_document",
    EVENT_IMAGE = "event_image",
    COMPANY_LOGO = "company_logo"
}
interface UploadResult {
    url: string;
    publicId: string;
    format: string;
    size: number;
    width?: number;
    height?: number;
}
export declare class FileUploadService {
    static createUploadMiddleware(fileType: FileType): multer.Multer;
    static uploadFile(file: Express.Multer.File, fileType: FileType, userId: string, additionalOptions?: any): Promise<UploadResult>;
    static deleteFile(publicId: string): Promise<boolean>;
    static generateOptimizedUrl(publicId: string, options?: any): string;
    static generateResponsiveUrls(publicId: string): {
        [key: string]: string;
    };
    static checkUserQuota(userId: string, fileSize: number): Promise<boolean>;
    static getFileInfo(publicId: string): Promise<{
        url: any;
        format: any;
        size: any;
        width: any;
        height: any;
        createdAt: any;
    }>;
    static validateFileType(file: Express.Multer.File): boolean;
    static cleanupOrphanedFiles(): Promise<number>;
}
export {};
//# sourceMappingURL=file-upload.d.ts.map