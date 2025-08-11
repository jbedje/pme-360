import { JWTPayload } from '../types';
export declare class JWTService {
    static generateAccessToken(payload: JWTPayload): string;
    static generateRefreshToken(payload: JWTPayload): string;
    static generateTokenPair(payload: JWTPayload): {
        accessToken: string;
        refreshToken: string;
    };
    static verifyAccessToken(token: string): JWTPayload | null;
    static verifyRefreshToken(token: string): {
        userId: string;
        email: string;
    } | null;
    static decodeToken(token: string): JWTPayload | null;
    static isTokenExpired(token: string): boolean;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static generateAuthResponse(payload: JWTPayload): {
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            tokenType: "Bearer";
        };
    };
}
//# sourceMappingURL=jwt.d.ts.map