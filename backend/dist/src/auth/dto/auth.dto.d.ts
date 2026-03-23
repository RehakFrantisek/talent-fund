import { UserRole } from '@prisma/client';
export interface RegisterDto {
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
    password: string;
}
export interface LoginDto {
    username: string;
    password: string;
}
export interface AuthUser {
    id: string;
    username: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    category: string | null;
    bio: string | null;
    achievements: string | null;
}
export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    profileImageUrl?: string | null;
    category?: string | null;
    bio?: string | null;
    achievements?: string | null;
}
