import { CampaignStatus, Category } from '@prisma/client';

export const campaignValidation = {
  title: { min: 5, max: 120 },
  shortDesc: { min: 20, max: 240 },
  story: { min: 50, max: 5000 },
  goalAmount: { min: 1000, max: 100000000 },
  image: { maxCount: 5 },
  reward: { maxCount: 10, titleMin: 3, titleMax: 80, descriptionMin: 3, descriptionMax: 400, amountMin: 1, amountMax: 100000000 },
} as const;

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
