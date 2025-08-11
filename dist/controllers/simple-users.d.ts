import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/simple-auth';
export declare class SimpleUsersController {
    static getAllUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<void>;
    static updateCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static addExpertise(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=simple-users.d.ts.map