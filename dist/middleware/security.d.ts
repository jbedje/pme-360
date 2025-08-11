import { Request, Response, NextFunction } from 'express';
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const messageRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const analyticsRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const speedLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const compressionMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const attackDetection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const botDetection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const ipBlacklist: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const addToBlacklist: (ip: string, reason?: string) => void;
export declare const removeFromBlacklist: (ip: string) => void;
export declare const auditLog: (req: Request, res: Response, next: NextFunction) => void;
export declare const corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    maxAge: number;
};
//# sourceMappingURL=security.d.ts.map