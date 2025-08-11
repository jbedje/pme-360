import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireVerified: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireProfileType: (allowedTypes: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwnership: (resourceUserId: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map