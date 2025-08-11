import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/simple-auth';
export declare class UsersController {
    static getAllUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<void>;
    static updateCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static addExpertise(req: AuthenticatedRequest, res: Response): Promise<void>;
    static removeExpertise(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=users.d.ts.map