import { BadRequestException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultUsers();
  }

  private sanitizeUser(user: {
    id: string;
    username: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    category: string | null;
    bio: string | null;
    achievements: string | null;
  }) {
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

  private toUtcDateOnly(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) throw new BadRequestException('Datum narození není platné.');
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Datum narození není platné.');
    return date;
  }

  private async ensureDefaultUsers() {
    const defaults = [
      {
        firstName: 'Admin',
        lastName: 'Account',
        birthDate: new Date(Date.UTC(1990, 0, 1)),
        username: 'admin',
        password: 'admin',
        role: UserRole.ADMIN,
      },
      {
        firstName: 'User',
        lastName: 'Account',
        birthDate: new Date(Date.UTC(1995, 0, 1)),
        username: 'user',
        password: 'user',
        role: UserRole.USER,
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

  async register(payload: RegisterDto) {
    const firstName = payload.firstName?.trim();
    const lastName = payload.lastName?.trim();
    const username = payload.username?.trim();
    if (!firstName || !lastName || !username || !payload.password || !payload.birthDate) {
      throw new BadRequestException('Všechna pole jsou povinná.');
    }

    const birthDate = this.toUtcDateOnly(payload.birthDate);
    const existingUsername = await this.prisma.user.findUnique({ where: { username } });
    if (existingUsername) throw new BadRequestException('Uživatelské jméno už existuje.');

    const existingIdentity = await this.prisma.user.findFirst({ where: { firstName, lastName, birthDate } });
    if (existingIdentity) throw new BadRequestException('Uživatel se stejným jménem a datem narození už existuje.');

    const user = await this.prisma.user.create({
      data: { firstName, lastName, birthDate, username, password: payload.password, role: UserRole.USER },
    });

    return this.createSession(user.id);
  }

  async login(payload: LoginDto) {
    const username = payload.username?.trim();
    if (!username || !payload.password) throw new BadRequestException('Vyplňte jméno a heslo.');

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== payload.password) throw new UnauthorizedException('Neplatné přihlášení.');

    return this.createSession(user.id);
  }

  async updateProfile(userId: string, payload: UpdateProfileDto, allowRoleUpdate = false) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new UnauthorizedException('Neplatný uživatel.');

    const data: Prisma.UserUpdateInput = {};
    if (payload.firstName !== undefined) {
      const firstName = payload.firstName.trim();
      if (!firstName) throw new BadRequestException('Jméno nesmí být prázdné.');
      data.firstName = firstName;
    }
    if (payload.lastName !== undefined) {
      const lastName = payload.lastName.trim();
      if (!lastName) throw new BadRequestException('Příjmení nesmí být prázdné.');
      data.lastName = lastName;
    }
    if (payload.birthDate !== undefined) data.birthDate = this.toUtcDateOnly(payload.birthDate);
    if (payload.username !== undefined) {
      const username = payload.username.trim();
      if (!username) throw new BadRequestException('Login nesmí být prázdný.');
      const existingUsername = await this.prisma.user.findUnique({ where: { username } });
      if (existingUsername && existingUsername.id !== userId) throw new BadRequestException('Uživatelské jméno už existuje.');
      data.username = username;
    }
    if (payload.password !== undefined) {
      const password = payload.password.trim();
      if (!password) throw new BadRequestException('Heslo nesmí být prázdné.');
      data.password = password;
    }
    if (payload.profileImageUrl !== undefined) data.profileImageUrl = payload.profileImageUrl;
    if (payload.category !== undefined) data.category = payload.category?.trim() || null;
    if (payload.bio !== undefined) data.bio = payload.bio?.trim() || null;
    if (payload.achievements !== undefined) data.achievements = payload.achievements?.trim() || null;
    if (allowRoleUpdate && payload.role !== undefined) data.role = payload.role;

    if (!Object.keys(data).length) throw new BadRequestException('Žádná data k uložení.');

    const nextFirstName = typeof data.firstName === 'string' ? data.firstName : existing.firstName;
    const nextLastName = typeof data.lastName === 'string' ? data.lastName : existing.lastName;
    const nextBirthDate = data.birthDate instanceof Date ? data.birthDate : existing.birthDate;

    const duplicate = await this.prisma.user.findFirst({
      where: { firstName: nextFirstName, lastName: nextLastName, birthDate: nextBirthDate, id: { not: userId } },
    });
    if (duplicate) throw new BadRequestException('Uživatel se stejným jménem a datem narození už existuje.');

    const updated = await this.prisma.user.update({ where: { id: userId }, data });
    return this.sanitizeUser(updated);
  }



  async listUsersForAdmin() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  updateUserForAdmin(userId: string, payload: UpdateProfileDto) {
    return this.updateProfile(userId, payload, true);
  }

  async getPublicProfiles() {
    const users = await this.prisma.user.findMany({
      where: { role: UserRole.USER },
      include: { campaigns: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      ...this.sanitizeUser(user),
      campaigns: user.campaigns,
    }));
  }

  async getPublicProfileById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { campaigns: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, include: { images: { orderBy: { sortOrder: 'asc' } } } } },
    });

    if (!user || user.role !== UserRole.USER) return null;
    return { ...this.sanitizeUser(user), campaigns: user.campaigns };
  }

  private async createSession(userId: string) {
    const token = randomUUID();
    await this.prisma.userSession.create({ data: { userId, token } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { token, user: this.sanitizeUser(user) };
  }

  async getUserFromAuthHeader(authHeader?: string | null) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return null;
    const session = await this.prisma.userSession.findUnique({ where: { token }, include: { user: true } });
    if (!session) return null;
    return this.sanitizeUser(session.user);
  }
}
