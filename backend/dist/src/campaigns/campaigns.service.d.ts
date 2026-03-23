import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/dto/auth.dto';
import { CampaignQueryDto, CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
export declare class CampaignsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildWhere;
    private applyVisibility;
    private withRelations;
    private normalizeString;
    private normalizeGoal;
    private normalizeImageUrls;
    private normalizeRewards;
    private validateCreate;
    private validateUpdate;
    findAll(query: CampaignQueryDto, requester: AuthUser | null): Prisma.PrismaPromise<({
        images: {
            id: string;
            createdAt: Date;
            url: string;
            sortOrder: number;
            campaignId: string;
        }[];
        rewards: {
            id: string;
            createdAt: Date;
            title: string;
            sortOrder: number;
            campaignId: string;
            description: string;
            amount: number;
            imageUrl: string | null;
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
    })[]>;
    getGoalBounds(query: CampaignQueryDto, requester: AuthUser | null): Promise<{
        minGoal: number;
        maxGoal: number;
    }>;
    findOne(id: string, requester: AuthUser | null): Prisma.Prisma__CampaignClient<({
        images: {
            id: string;
            createdAt: Date;
            url: string;
            sortOrder: number;
            campaignId: string;
        }[];
        rewards: {
            id: string;
            createdAt: Date;
            title: string;
            sortOrder: number;
            campaignId: string;
            description: string;
            amount: number;
            imageUrl: string | null;
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    create(data: CreateCampaignDto, requester: AuthUser): Promise<{
        images: {
            id: string;
            createdAt: Date;
            url: string;
            sortOrder: number;
            campaignId: string;
        }[];
        rewards: {
            id: string;
            createdAt: Date;
            title: string;
            sortOrder: number;
            campaignId: string;
            description: string;
            amount: number;
            imageUrl: string | null;
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
    }>;
    update(id: string, data: UpdateCampaignDto, requester: AuthUser): Promise<({
        images: {
            id: string;
            createdAt: Date;
            url: string;
            sortOrder: number;
            campaignId: string;
        }[];
        rewards: {
            id: string;
            createdAt: Date;
            title: string;
            sortOrder: number;
            campaignId: string;
            description: string;
            amount: number;
            imageUrl: string | null;
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
    }) | null>;
    submit(id: string, requester: AuthUser): Promise<({
        images: {
            id: string;
            createdAt: Date;
            url: string;
            sortOrder: number;
            campaignId: string;
        }[];
        rewards: {
            id: string;
            createdAt: Date;
            title: string;
            sortOrder: number;
            campaignId: string;
            description: string;
            amount: number;
            imageUrl: string | null;
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
    }) | null>;
}
