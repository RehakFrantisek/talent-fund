"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureDefaultUsers();
    }
    sanitizeUser(user) {
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            category: user.category,
            bio: user.bio,
            achievements: user.achievements,
        };
    }
    toUtcDateOnly(value) {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day)
            throw new common_1.BadRequestException('Datum narození není platné.');
        const date = new Date(Date.UTC(year, month - 1, day));
        if (Number.isNaN(date.getTime()))
            throw new common_1.BadRequestException('Datum narození není platné.');
        return date;
    }
    async ensureDefaultUsers() {
        const defaults = [
            {
                firstName: 'Admin',
                lastName: 'Account',
                birthDate: new Date(Date.UTC(1990, 0, 1)),
                username: 'admin',
                password: 'admin',
                role: client_1.UserRole.ADMIN,
            },
            {
                firstName: 'User',
                lastName: 'Account',
                birthDate: new Date(Date.UTC(1995, 0, 1)),
                username: 'user',
                password: 'user',
                role: client_1.UserRole.USER,
            },
        ];
        for (const item of defaults) {
            const exists = await this.prisma.user.findUnique({ where: { username: item.username } });
            if (!exists) {
                await this.prisma.user.create({ data: item });
                continue;
            }
            if (exists.password !== item.password || exists.role !== item.role) {
                await this.prisma.user.update({ where: { id: exists.id }, data: { password: item.password, role: item.role } });
            }
        }
    }
    async register(payload) {
        const firstName = payload.firstName?.trim();
        const lastName = payload.lastName?.trim();
        const username = payload.username?.trim();
        if (!firstName || !lastName || !username || !payload.password || !payload.birthDate) {
            throw new common_1.BadRequestException('Všechna pole jsou povinná.');
        }
        const birthDate = this.toUtcDateOnly(payload.birthDate);
        const existingUsername = await this.prisma.user.findUnique({ where: { username } });
        if (existingUsername)
            throw new common_1.BadRequestException('Uživatelské jméno už existuje.');
        const existingIdentity = await this.prisma.user.findFirst({ where: { firstName, lastName, birthDate } });
        if (existingIdentity)
            throw new common_1.BadRequestException('Uživatel se stejným jménem a datem narození už existuje.');
        const user = await this.prisma.user.create({
            data: { firstName, lastName, birthDate, username, password: payload.password, role: client_1.UserRole.USER },
        });
        return this.createSession(user.id);
    }
    async login(payload) {
        const username = payload.username?.trim();
        if (!username || !payload.password)
            throw new common_1.BadRequestException('Vyplňte jméno a heslo.');
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user || user.password !== payload.password)
            throw new common_1.UnauthorizedException('Neplatné přihlášení.');
        return this.createSession(user.id);
    }
    async updateProfile(userId, payload, allowRoleUpdate = false) {
        const existing = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!existing)
            throw new common_1.UnauthorizedException('Neplatný uživatel.');
        const data = {};
        if (payload.firstName !== undefined) {
            const firstName = payload.firstName.trim();
            if (!firstName)
                throw new common_1.BadRequestException('Jméno nesmí být prázdné.');
            data.firstName = firstName;
        }
        if (payload.lastName !== undefined) {
            const lastName = payload.lastName.trim();
            if (!lastName)
                throw new common_1.BadRequestException('Příjmení nesmí být prázdné.');
            data.lastName = lastName;
        }
        if (payload.birthDate !== undefined)
            data.birthDate = this.toUtcDateOnly(payload.birthDate);
        if (payload.username !== undefined) {
            const username = payload.username.trim();
            if (!username)
                throw new common_1.BadRequestException('Login nesmí být prázdný.');
            const existingUsername = await this.prisma.user.findUnique({ where: { username } });
            if (existingUsername && existingUsername.id !== userId)
                throw new common_1.BadRequestException('Uživatelské jméno už existuje.');
            data.username = username;
        }
        if (payload.password !== undefined) {
            const password = payload.password.trim();
            if (!password)
                throw new common_1.BadRequestException('Heslo nesmí být prázdné.');
            data.password = password;
        }
        if (payload.profileImageUrl !== undefined)
            data.profileImageUrl = payload.profileImageUrl;
        if (payload.category !== undefined)
            data.category = payload.category?.trim() || null;
        if (payload.bio !== undefined)
            data.bio = payload.bio?.trim() || null;
        if (payload.achievements !== undefined)
            data.achievements = payload.achievements?.trim() || null;
        if (allowRoleUpdate && payload.role !== undefined)
            data.role = payload.role;
        if (!Object.keys(data).length)
            throw new common_1.BadRequestException('Žádná data k uložení.');
        const nextFirstName = typeof data.firstName === 'string' ? data.firstName : existing.firstName;
        const nextLastName = typeof data.lastName === 'string' ? data.lastName : existing.lastName;
        const nextBirthDate = data.birthDate instanceof Date ? data.birthDate : existing.birthDate;
        const duplicate = await this.prisma.user.findFirst({
            where: { firstName: nextFirstName, lastName: nextLastName, birthDate: nextBirthDate, id: { not: userId } },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Uživatel se stejným jménem a datem narození už existuje.');
        const updated = await this.prisma.user.update({ where: { id: userId }, data });
        return this.sanitizeUser(updated);
    }
    async listUsersForAdmin() {
        const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        return users.map((user) => this.sanitizeUser(user));
    }
    updateUserForAdmin(userId, payload) {
        return this.updateProfile(userId, payload, true);
    }
    async getPublicProfiles() {
        const users = await this.prisma.user.findMany({
            where: { role: client_1.UserRole.USER },
            include: { campaigns: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' },
        });
        return users.map((user) => ({
            ...this.sanitizeUser(user),
            campaigns: user.campaigns,
        }));
    }
    async getPublicProfileById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { campaigns: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, include: { images: { orderBy: { sortOrder: 'asc' } } } } },
        });
        if (!user || user.role !== client_1.UserRole.USER)
            return null;
        return { ...this.sanitizeUser(user), campaigns: user.campaigns };
    }
    async createSession(userId) {
        const token = (0, crypto_1.randomUUID)();
        await this.prisma.userSession.create({ data: { userId, token } });
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        return { token, user: this.sanitizeUser(user) };
    }
    async getUserFromAuthHeader(authHeader) {
        if (!authHeader?.startsWith('Bearer '))
            return null;
        const token = authHeader.slice('Bearer '.length).trim();
        if (!token)
            return null;
        const session = await this.prisma.userSession.findUnique({ where: { token }, include: { user: true } });
        if (!session)
            return null;
        return this.sanitizeUser(session.user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map