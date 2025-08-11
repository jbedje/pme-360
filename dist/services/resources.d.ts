import { ResourceType } from '@prisma/client';
export interface CreateResourceData {
    title: string;
    description: string;
    content?: string;
    url?: string;
    thumbnail?: string;
    thumbnailFile?: Express.Multer.File;
    creatorId?: string;
    type: ResourceType;
    author: string;
    tags?: string[];
    isPremium?: boolean;
}
export interface ResourceFilters {
    type?: string;
    author?: string;
    search?: string;
    tags?: string;
    isPremium?: boolean;
}
export interface ResourcePagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ResourcesService {
    static createResource(resourceData: CreateResourceData): Promise<{
        tags: {
            id: string;
            tag: string;
            resourceId: string;
        }[];
    } & {
        type: import(".prisma/client").$Enums.ResourceType;
        id: string;
        description: string;
        url: string | null;
        createdAt: Date;
        updatedAt: Date;
        thumbnail: string | null;
        title: string;
        content: string | null;
        author: string;
        isPremium: boolean;
        viewCount: number;
    }>;
    static getResources(filters: ResourceFilters, pagination: ResourcePagination): Promise<{
        resources: ({
            tags: {
                id: string;
                tag: string;
                resourceId: string;
            }[];
        } & {
            type: import(".prisma/client").$Enums.ResourceType;
            id: string;
            description: string;
            url: string | null;
            createdAt: Date;
            updatedAt: Date;
            thumbnail: string | null;
            title: string;
            content: string | null;
            author: string;
            isPremium: boolean;
            viewCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static getResourceById(resourceId: string, incrementView?: boolean): Promise<{
        tags: {
            id: string;
            tag: string;
            resourceId: string;
        }[];
    } & {
        type: import(".prisma/client").$Enums.ResourceType;
        id: string;
        description: string;
        url: string | null;
        createdAt: Date;
        updatedAt: Date;
        thumbnail: string | null;
        title: string;
        content: string | null;
        author: string;
        isPremium: boolean;
        viewCount: number;
    }>;
    static updateResource(resourceId: string, authorName: string, updateData: Partial<CreateResourceData>): Promise<{
        tags: {
            id: string;
            tag: string;
            resourceId: string;
        }[];
    } & {
        type: import(".prisma/client").$Enums.ResourceType;
        id: string;
        description: string;
        url: string | null;
        createdAt: Date;
        updatedAt: Date;
        thumbnail: string | null;
        title: string;
        content: string | null;
        author: string;
        isPremium: boolean;
        viewCount: number;
    }>;
    static deleteResource(resourceId: string, authorName: string): Promise<{
        success: boolean;
    }>;
    static getResourcesByAuthor(authorName: string, pagination: ResourcePagination): Promise<{
        resources: ({
            tags: {
                id: string;
                tag: string;
                resourceId: string;
            }[];
        } & {
            type: import(".prisma/client").$Enums.ResourceType;
            id: string;
            description: string;
            url: string | null;
            createdAt: Date;
            updatedAt: Date;
            thumbnail: string | null;
            title: string;
            content: string | null;
            author: string;
            isPremium: boolean;
            viewCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static getPopularResources(pagination: ResourcePagination): Promise<{
        resources: ({
            tags: {
                id: string;
                tag: string;
                resourceId: string;
            }[];
        } & {
            type: import(".prisma/client").$Enums.ResourceType;
            id: string;
            description: string;
            url: string | null;
            createdAt: Date;
            updatedAt: Date;
            thumbnail: string | null;
            title: string;
            content: string | null;
            author: string;
            isPremium: boolean;
            viewCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
//# sourceMappingURL=resources.d.ts.map