import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>;
    static resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    static resendVerificationEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map