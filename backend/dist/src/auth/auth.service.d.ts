import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
export declare class AuthService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private sanitizeUser;
    private toUtcDateOnly;
    private ensureDefaultUsers;
    register(payload: RegisterDto): Promise<{
        token: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
            firstName: string;
            lastName: string;
            profileImageUrl: string | null;
            category: string | null;
            bio: string | null;
            achievements: string | null;
        };
    }>;
    login(payload: LoginDto): Promise<{
        token: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
            firstName: string;
            lastName: string;
            profileImageUrl: string | null;
            category: string | null;
            bio: string | null;
            achievements: string | null;
        };
    }>;
    updateProfile(userId: string, payload: UpdateProfileDto, allowRoleUpdate?: boolean): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    }>;
    listUsersForAdmin(): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    }[]>;
    updateUserForAdmin(userId: string, payload: UpdateProfileDto): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    }>;
    getPublicProfiles(): Promise<{
        campaigns: {
            id: string;
            category: import(".prisma/client").$Enums.Category;
            createdAt: Date;
            title: string;
            shortDesc: string;
            story: string;
            goalAmount: number;
            currentAmount: number;
            status: import(".prisma/client").$Enums.CampaignStatus;
            coverImageUrl: string | null;
            ownerKey: string;
            updatedAt: Date;
            ownerId: string | null;
        }[];
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    }[]>;
    getPublicProfileById(id: string): Promise<{
        campaigns: ({
            images: {
                id: string;
                createdAt: Date;
                url: string;
                sortOrder: number;
                campaignId: string;
            }[];
        } & {
            id: string;
            category: import(".prisma/client").$Enums.Category;
            createdAt: Date;
            title: string;
            shortDesc: string;
            story: string;
            goalAmount: number;
            currentAmount: number;
            status: import(".prisma/client").$Enums.CampaignStatus;
            coverImageUrl: string | null;
            ownerKey: string;
            updatedAt: Date;
            ownerId: string | null;
        })[];
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    } | null>;
    private createSession;
    getUserFromAuthHeader(authHeader?: string | null): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        category: string | null;
        bio: string | null;
        achievements: string | null;
    } | null>;
}
