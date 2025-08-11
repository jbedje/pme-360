import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/simple-auth';
export declare class SimpleAuthController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=simple-auth.d.ts.map