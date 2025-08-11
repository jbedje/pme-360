interface UpdateUserData {
    name?: string;
    company?: string;
    location?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    phone?: string;
    avatar?: string;
    avatarFile?: Express.Multer.File;
}
interface UserFilters {
    profileType?: string;
    location?: string;
    verified?: boolean;
    search?: string;
}
interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class UsersService {
    static getAllUsers(filters?: UserFilters, pagination?: PaginationParams): Promise<{
        users: {
            name: string;
            id: string;
            description: string | null;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            status: import(".prisma/client").$Enums.UserStatus;
            company: string | null;
            location: string | null;
            avatar: string | null;
            website: string | null;
            linkedin: string | null;
            verified: boolean;
            completionScore: number;
            rating: number | null;
            reviewCount: number;
            createdAt: Date;
            updatedAt: Date;
            lastLogin: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static getUserById(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
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
        stats: {
            connectionsCount: number;
            opportunitiesCount: number;
            applicationsCount: number;
        };
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    static updateUser(userId: string, updateData: UpdateUserData): Promise<{
        id: string;
        name: string;
        email: string;
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
        updatedAt: Date;
    }>;
    static deleteUser(userId: string): Promise<void>;
    static addExpertise(userId: string, expertiseData: {
        name: string;
        level: number;
    }): Promise<{
        id: string;
        name: string;
        level: number;
        verified: boolean;
    }>;
    static removeExpertise(userId: string, expertiseId: string): Promise<void>;
    private static calculateCompletionScore;
}
export {};
//# sourceMappingURL=users.d.ts.map