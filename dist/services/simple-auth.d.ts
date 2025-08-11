interface RegisterData {
    name: string;
    email: string;
    password: string;
    profileType: string;
    company?: string;
    location?: string;
}
interface LoginCredentials {
    email: string;
    password: string;
}
export declare class SimpleAuthService {
    static register(userData: RegisterData): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            status: import(".prisma/client").$Enums.UserStatus;
            company: string | null;
            location: string | null;
            verified: boolean;
            completionScore: number;
            createdAt: Date;
            updatedAt: Date;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            tokenType: "Bearer";
        };
    }>;
    static login(credentials: LoginCredentials): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            status: import(".prisma/client").$Enums.UserStatus;
            company: string | null;
            location: string | null;
            verified: boolean;
            completionScore: number;
            createdAt: Date;
            updatedAt: Date;
            lastLogin: Date | null;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            tokenType: "Bearer";
        };
    }>;
    static getUserById(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        profileType: import(".prisma/client").$Enums.ProfileType;
        status: import(".prisma/client").$Enums.UserStatus;
        company: string | null;
        location: string | null;
        avatar: string | null;
        description: string | null;
        website: string | null;
        linkedin: string | null;
        phone: string | null;
        verified: boolean;
        completionScore: number;
        rating: number | null;
        reviewCount: number;
        expertises: {
            id: string;
            name: string;
            level: number;
            verified: boolean;
        }[];
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
}
export {};
//# sourceMappingURL=simple-auth.d.ts.map