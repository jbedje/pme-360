import { LoginCredentials, AuthResponse, RegisterData } from '../types';
export declare class AuthService {
    static register(userData: RegisterData): Promise<AuthResponse>;
    static login(credentials: LoginCredentials): Promise<AuthResponse>;
    static refreshTokens(refreshToken: string): Promise<{
        tokens: any;
    }>;
    static logout(userId: string): Promise<void>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static requestPasswordReset(email: string): Promise<void>;
    static resetPassword(userId: string, resetToken: string, newPassword: string): Promise<void>;
    private static storeRefreshToken;
}
//# sourceMappingURL=auth.d.ts.map