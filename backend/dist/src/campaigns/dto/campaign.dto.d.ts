import { CampaignStatus, Category } from '@prisma/client';
export declare const campaignValidation: {
    readonly title: {
        readonly min: 5;
        readonly max: 120;
    };
    readonly shortDesc: {
        readonly min: 20;
        readonly max: 240;
    };
    readonly story: {
        readonly min: 50;
        readonly max: 5000;
    };
    readonly goalAmount: {
        readonly min: 1000;
        readonly max: 100000000;
    };
    readonly image: {
        readonly maxCount: 5;
    };
    readonly reward: {
        readonly maxCount: 10;
        readonly titleMin: 3;
        readonly titleMax: 80;
        readonly descriptionMin: 3;
        readonly descriptionMax: 400;
        readonly amountMin: 1;
        readonly amountMax: 100000000;
    };
};
export interface CampaignRewardDto {
    title: string;
    description: string;
    amount: number;
    imageUrl?: string | null;
}
export interface CampaignQueryDto {
    category?: Category;
    status?: CampaignStatus;
    q?: string;
    ownerKey?: string;
    ownerId?: string;
    minGoal?: string;
    maxGoal?: string;
    sort?: 'Nejpopulárnější' | 'Nejnovější' | 'Cíl vzestupně' | 'Cíl sestupně';
}
export interface CreateCampaignDto {
    title: string;
    shortDesc: string;
    story: string;
    category: Category;
    goalAmount: number;
    currentAmount?: number;
    coverImageUrl?: string | null;
    imageUrls?: string[];
    rewards?: CampaignRewardDto[];
    ownerKey?: string;
    ownerId?: string;
}
export interface UpdateCampaignDto {
    title?: string;
    shortDesc?: string;
    story?: string;
    category?: Category;
    goalAmount?: number;
    currentAmount?: number;
    coverImageUrl?: string | null;
    imageUrls?: string[];
    rewards?: CampaignRewardDto[];
    status?: CampaignStatus;
}
