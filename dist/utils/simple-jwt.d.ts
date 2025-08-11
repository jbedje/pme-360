interface SimpleJWTPayload {
    userId: string;
    email: string;
    profileType: string;
    verified: boolean;
}
export declare class SimpleJWTService {
    static generateAccessToken(payload: SimpleJWTPayload): string;
    static generateRefreshToken(payload: SimpleJWTPayload): string;
    static verifyAccessToken(token: string): SimpleJWTPayload | null;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static generateAuthResponse(payload: SimpleJWTPayload): {
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            tokenType: "Bearer";
        };
    };
}
export {};
//# sourceMappingURL=simple-jwt.d.ts.map