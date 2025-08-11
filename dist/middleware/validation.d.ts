import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export interface ValidationTargets {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    received?: any;
}
export declare const validate: (schemas: ValidationTargets) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateFileUpload: (allowedTypes: string[], maxSize: number, required?: boolean) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePermissions: (requiredPermissions: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validation.d.ts.map