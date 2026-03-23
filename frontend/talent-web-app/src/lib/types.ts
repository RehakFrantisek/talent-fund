export type Category = "Sport" | "Hudba" | "Věda" | "Umění" | "Technologie";
export type CampaignStatus = "DRAFT" | "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED" | "DELETED";
export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  category?: string | null;
  bio?: string | null;
  achievements?: string | null;
}

export interface PublicProfile extends AuthUser {
  campaigns: ApiCampaign[];
}

export interface Talent {
  id: string;
  name: string;
  age: number;
  category: Category;
  region: string;
  bio: string;
  avatar: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorName: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export interface ApiCampaignImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ApiCampaignReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface ApiCampaign {
  id: string;
  title: string;
  shortDesc: string;
  story: string;
  category: Category;
  goalAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  coverImageUrl: string | null;
  imageUrls: string[];
  images: ApiCampaignImage[];
  rewards: ApiCampaignReward[];
  ownerKey: string;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilters {
  category?: Category | "Vše";
  categories?: Category[];
  q?: string;
  status?: CampaignStatus | "Vše";
  statuses?: CampaignStatus[];
  ownerKey?: string;
  ownerId?: string;
  minGoal?: number;
  maxGoal?: number;
  sort?: "Nejpopulárnější" | "Nejnovější" | "Cíl vzestupně" | "Cíl sestupně";
}

export interface CampaignRewardPayload {
  title: string;
  description: string;
  amount: number;
  imageUrl?: string | null;
}

export interface CampaignPayload {
  title: string;
  shortDesc: string;
  story: string;
  category: Category;
  goalAmount: number;
  coverImageUrl?: string | null;
  imageUrls?: string[];
  rewards?: CampaignRewardPayload[];
  ownerKey?: string;
  ownerId?: string;
}


export interface AdminUserUpdatePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  category?: string | null;
  bio?: string | null;
  achievements?: string | null;
  role?: UserRole;
}
