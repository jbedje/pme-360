import { OpportunityType } from '@prisma/client';
export interface CreateOpportunityData {
    title: string;
    description: string;
    type: OpportunityType;
    budget?: string;
    amount?: string;
    location?: string;
    remote?: boolean;
    deadline?: Date;
    startDate?: Date;
    skills?: string[];
    experience?: string;
}
export interface OpportunityFilters {
    type?: string;
    status?: string;
    location?: string;
    remote?: boolean;
    minBudget?: number;
    maxBudget?: number;
    skills?: string;
    search?: string;
    authorId?: string;
}
export interface OpportunityPagination {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface ApplyToOpportunityData {
    coverLetter: string;
    proposedRate?: string;
    availability?: string;
}
export declare class OpportunitiesService {
    static createOpportunity(authorId: string, opportunityData: CreateOpportunityData): Promise<{
        _count: {
            applications: number;
        };
        skills: {
            id: string;
            skill: string;
            opportunityId: string;
        }[];
        author: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            company: string | null;
            avatar: string | null;
        };
    } & {
        type: import(".prisma/client").$Enums.OpportunityType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        budget: string | null;
        amount: string | null;
        remote: boolean;
        deadline: Date | null;
        startDate: Date | null;
        experience: string | null;
        authorId: string;
    }>;
    static getOpportunities(filters: OpportunityFilters, pagination: OpportunityPagination): Promise<{
        opportunities: ({
            _count: {
                applications: number;
            };
            skills: {
                id: string;
                skill: string;
                opportunityId: string;
            }[];
            author: {
                name: string;
                id: string;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                company: string | null;
                location: string | null;
                avatar: string | null;
            };
        } & {
            type: import(".prisma/client").$Enums.OpportunityType;
            id: string;
            description: string;
            status: import(".prisma/client").$Enums.OpportunityStatus;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            budget: string | null;
            amount: string | null;
            remote: boolean;
            deadline: Date | null;
            startDate: Date | null;
            experience: string | null;
            authorId: string;
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
    static getOpportunityById(opportunityId: string, userId?: string): Promise<{
        applications: {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            createdAt: Date;
            updatedAt: Date;
            applicantId: string;
            opportunityId: string;
            coverLetter: string;
            proposedRate: string | null;
            availability: string | null;
        }[];
        _count: {
            applications: number;
        };
        skills: {
            id: string;
            skill: string;
            opportunityId: string;
        }[];
        author: {
            name: string;
            id: string;
            description: string | null;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            company: string | null;
            location: string | null;
            avatar: string | null;
            website: string | null;
            linkedin: string | null;
        };
    } & {
        type: import(".prisma/client").$Enums.OpportunityType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        budget: string | null;
        amount: string | null;
        remote: boolean;
        deadline: Date | null;
        startDate: Date | null;
        experience: string | null;
        authorId: string;
    }>;
    static updateOpportunity(opportunityId: string, authorId: string, updateData: Partial<CreateOpportunityData>): Promise<{
        _count: {
            applications: number;
        };
        skills: {
            id: string;
            skill: string;
            opportunityId: string;
        }[];
        author: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            company: string | null;
            avatar: string | null;
        };
    } & {
        type: import(".prisma/client").$Enums.OpportunityType;
        id: string;
        description: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        budget: string | null;
        amount: string | null;
        remote: boolean;
        deadline: Date | null;
        startDate: Date | null;
        experience: string | null;
        authorId: string;
    }>;
    static deleteOpportunity(opportunityId: string, authorId: string): Promise<{
        success: boolean;
    }>;
    static applyToOpportunity(opportunityId: string, applicantId: string, applicationData: ApplyToOpportunityData): Promise<{
        opportunity: {
            type: import(".prisma/client").$Enums.OpportunityType;
            id: string;
            title: string;
            author: {
                name: string;
                email: string;
            };
        };
        applicant: {
            name: string;
            id: string;
            email: string;
            profileType: import(".prisma/client").$Enums.ProfileType;
            company: string | null;
            location: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        applicantId: string;
        opportunityId: string;
        coverLetter: string;
        proposedRate: string | null;
        availability: string | null;
    }>;
    static getApplications(opportunityId: string, authorId: string, pagination: OpportunityPagination): Promise<{
        applications: ({
            attachments: {
                size: number | null;
                id: string;
                url: string;
                filename: string;
                mimeType: string | null;
                applicationId: string;
            }[];
            applicant: {
                name: string;
                id: string;
                description: string | null;
                email: string;
                profileType: import(".prisma/client").$Enums.ProfileType;
                company: string | null;
                location: string | null;
                avatar: string | null;
                website: string | null;
                linkedin: string | null;
                rating: number | null;
                reviewCount: number;
                expertises: {
                    level: number;
                    name: string;
                    id: string;
                    verified: boolean;
                    userId: string;
                }[];
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            createdAt: Date;
            updatedAt: Date;
            applicantId: string;
            opportunityId: string;
            coverLetter: string;
            proposedRate: string | null;
            availability: string | null;
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
    static getUserApplications(userId: string, pagination: OpportunityPagination): Promise<{
        applications: ({
            attachments: {
                size: number | null;
                id: string;
                url: string;
                filename: string;
                mimeType: string | null;
                applicationId: string;
            }[];
            opportunity: {
                skills: {
                    id: string;
                    skill: string;
                    opportunityId: string;
                }[];
                author: {
                    name: string;
                    id: string;
                    company: string | null;
                    avatar: string | null;
                };
            } & {
                type: import(".prisma/client").$Enums.OpportunityType;
                id: string;
                description: string;
                status: import(".prisma/client").$Enums.OpportunityStatus;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                budget: string | null;
                amount: string | null;
                remote: boolean;
                deadline: Date | null;
                startDate: Date | null;
                experience: string | null;
                authorId: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            createdAt: Date;
            updatedAt: Date;
            applicantId: string;
            opportunityId: string;
            coverLetter: string;
            proposedRate: string | null;
            availability: string | null;
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
//# sourceMappingURL=opportunities.d.ts.map