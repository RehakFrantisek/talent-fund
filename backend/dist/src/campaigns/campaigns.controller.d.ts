import { CampaignsService } from './campaigns.service';
import { CampaignQueryDto, CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { AuthService } from '../auth/auth.service';
export declare class CampaignsController {
    private readonly campaignsService;
    private readonly authService;
    constructor(campaignsService: CampaignsService, authService: AuthService);
    goalBounds(query: CampaignQueryDto, authorization?: string): Promise<{
        minGoal: number;
        maxGoal: number;
    }>;
    findAll(query: CampaignQueryDto, authorization?: string): Promise<({
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
    findOne(id: string, authorization?: string): Promise<{
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
    uploadImage(body: {
        fileName?: string;
        data?: string;
    }, authorization?: string): Promise<{
        url: string;
    }>;
    create(body: CreateCampaignDto, authorization?: string): Promise<{
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
    update(id: string, body: UpdateCampaignDto, authorization?: string): Promise<{
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
    submit(id: string, authorization?: string): Promise<{
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
}
