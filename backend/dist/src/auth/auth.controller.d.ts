import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
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
    login(body: LoginDto): Promise<{
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
    profiles(): Promise<{
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
    profileById(id: string): Promise<{
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
    }>;
    me(authorization?: string): Promise<{
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
    updateMe(body: UpdateProfileDto, authorization?: string): Promise<{
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
    listUsers(authorization?: string): Promise<{
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
    updateUser(id: string, body: UpdateProfileDto, authorization?: string): Promise<{
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
}
