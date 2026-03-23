import { BadRequestException, Injectable } from '@nestjs/common';
import { extname } from 'path';
import { CampaignStatus, Category, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/dto/auth.dto';
import { CampaignQueryDto, CreateCampaignDto, UpdateCampaignDto, campaignValidation } from './dto/campaign.dto';

const validCategories = new Set(Object.values(Category));
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: CampaignQueryDto, includeGoalRange = true): Prisma.CampaignWhereInput {
    const minGoal = query.minGoal ? Number(query.minGoal) : undefined;
    const maxGoal = query.maxGoal ? Number(query.maxGoal) : undefined;

    return {
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerKey ? { ownerKey: query.ownerKey } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(includeGoalRange && (typeof minGoal === 'number' || typeof maxGoal === 'number')
        ? {
            goalAmount: {
              ...(typeof minGoal === 'number' ? { gte: minGoal } : {}),
              ...(typeof maxGoal === 'number' ? { lte: maxGoal } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [{ title: { contains: query.q } }, { shortDesc: { contains: query.q } }, { story: { contains: query.q } }],
          }
        : {}),
    };
  }

  private applyVisibility(where: Prisma.CampaignWhereInput, requester: AuthUser | null): Prisma.CampaignWhereInput {
    if (requester?.role === UserRole.ADMIN) return where;

    const visibility: Prisma.CampaignWhereInput = requester ? { OR: [{ status: CampaignStatus.APPROVED }, { ownerId: requester.id }] } : {};
    return { AND: [where, visibility] };
  }

  private withRelations() {
    return {
      images: { orderBy: { sortOrder: 'asc' } },
      rewards: { orderBy: { sortOrder: 'asc' } },
    } satisfies Prisma.CampaignInclude;
  }

  private normalizeString(value: unknown, field: string, min: number, max: number) {
    if (typeof value !== 'string') throw new BadRequestException(`${field} musí být text.`);
    const trimmed = value.trim();
    if (!trimmed) throw new BadRequestException(`${field} je povinné pole.`);
    if (trimmed.length < min || trimmed.length > max) throw new BadRequestException(`${field} musí mít ${min} až ${max} znaků.`);
    return trimmed;
  }

  private normalizeGoal(value: unknown) {
    if (typeof value !== 'number' || !Number.isInteger(value)) throw new BadRequestException('Cílová částka musí být celé číslo.');
    if (value < campaignValidation.goalAmount.min || value > campaignValidation.goalAmount.max) {
      throw new BadRequestException(`Cílová částka musí být mezi ${campaignValidation.goalAmount.min} a ${campaignValidation.goalAmount.max}.`);
    }
    return value;
  }

  private normalizeImageUrls(value: unknown) {
    if (value === undefined) return undefined;
    if (!Array.isArray(value)) throw new BadRequestException('Obrázky musí být pole URL adres.');
    if (value.length > campaignValidation.image.maxCount) throw new BadRequestException(`Můžete uložit maximálně ${campaignValidation.image.maxCount} obrázků.`);

    return value
      .map((item, index) => {
        if (typeof item !== 'string' || !item.trim()) throw new BadRequestException(`Obrázek na pozici ${index + 1} není platná URL.`);
        return item.trim();
      })
      .filter((url) => {
        const cleanUrl = url.split('?')[0].split('#')[0] ?? '';
        const extension = extname(cleanUrl).toLowerCase();
        return !extension || allowedImageExtensions.has(extension);
      });
  }

  private normalizeRewards(value: unknown) {
    if (value === undefined) return undefined;
    if (!Array.isArray(value)) throw new BadRequestException('Odměny musí být pole.');
    if (value.length > campaignValidation.reward.maxCount) throw new BadRequestException(`Můžete uložit maximálně ${campaignValidation.reward.maxCount} odměn.`);

    return value.map((item, index) => {
      if (!item || typeof item !== 'object') throw new BadRequestException(`Odměna na pozici ${index + 1} není platná.`);
      const reward = item as { title?: unknown; description?: unknown; amount?: unknown; imageUrl?: unknown };
      const title = this.normalizeString(reward.title, `Název odměny #${index + 1}`, campaignValidation.reward.titleMin, campaignValidation.reward.titleMax);
      const description = this.normalizeString(reward.description, `Popis odměny #${index + 1}`, campaignValidation.reward.descriptionMin, campaignValidation.reward.descriptionMax);
      const imageUrl = typeof reward.imageUrl === 'string' ? reward.imageUrl.trim() : '';
      if (reward.imageUrl !== undefined && reward.imageUrl !== null && typeof reward.imageUrl !== 'string') {
        throw new BadRequestException(`Obrázek odměny #${index + 1} musí být URL adresa.`);
      }
      if (imageUrl) {
        const cleanUrl = imageUrl.split('?')[0].split('#')[0] ?? '';
        const extension = extname(cleanUrl).toLowerCase();
        if (extension && !allowedImageExtensions.has(extension)) {
          throw new BadRequestException(`Obrázek odměny #${index + 1} musí být JPG, PNG, WEBP, GIF nebo SVG.`);
        }
      }
      if (typeof reward.amount !== 'number' || !Number.isInteger(reward.amount)) {
        throw new BadRequestException(`Částka odměny #${index + 1} musí být celé číslo.`);
      }
      if (reward.amount < campaignValidation.reward.amountMin || reward.amount > campaignValidation.reward.amountMax) {
        throw new BadRequestException(`Částka odměny #${index + 1} je mimo povolený rozsah.`);
      }
      return { title, description, amount: reward.amount, imageUrl: imageUrl || null };
    });
  }

  private validateCreate(data: CreateCampaignDto) {
    const title = this.normalizeString(data.title, 'Název projektu', campaignValidation.title.min, campaignValidation.title.max);
    const shortDesc = this.normalizeString(data.shortDesc, 'Krátký popis', campaignValidation.shortDesc.min, campaignValidation.shortDesc.max);
    const story = this.normalizeString(data.story, 'Podrobný popis', campaignValidation.story.min, campaignValidation.story.max);
    const goalAmount = this.normalizeGoal(data.goalAmount);
    if (!validCategories.has(data.category)) throw new BadRequestException('Kategorie projektu není platná.');
    const imageUrls = this.normalizeImageUrls(data.imageUrls ?? (data.coverImageUrl ? [data.coverImageUrl] : [])) ?? [];
    const rewards = this.normalizeRewards(data.rewards) ?? [];

    return { ...data, title, shortDesc, story, goalAmount, imageUrls, rewards, coverImageUrl: imageUrls[0] ?? null };
  }

  private validateUpdate(data: UpdateCampaignDto) {
    const validated: UpdateCampaignDto = { ...data };
    if (data.title !== undefined) validated.title = this.normalizeString(data.title, 'Název projektu', campaignValidation.title.min, campaignValidation.title.max);
    if (data.shortDesc !== undefined) validated.shortDesc = this.normalizeString(data.shortDesc, 'Krátký popis', campaignValidation.shortDesc.min, campaignValidation.shortDesc.max);
    if (data.story !== undefined) validated.story = this.normalizeString(data.story, 'Podrobný popis', campaignValidation.story.min, campaignValidation.story.max);
    if (data.goalAmount !== undefined) validated.goalAmount = this.normalizeGoal(data.goalAmount);
    if (data.category !== undefined && !validCategories.has(data.category)) throw new BadRequestException('Kategorie projektu není platná.');

    if (data.imageUrls !== undefined || data.coverImageUrl !== undefined) {
      const urls = this.normalizeImageUrls(data.imageUrls ?? (data.coverImageUrl ? [data.coverImageUrl] : []));
      validated.imageUrls = urls;
      validated.coverImageUrl = urls?.[0] ?? null;
    }

    if (data.rewards !== undefined) {
      validated.rewards = this.normalizeRewards(data.rewards);
    }

    return validated;
  }

  findAll(query: CampaignQueryDto, requester: AuthUser | null) {
    const where = this.applyVisibility(this.buildWhere(query), requester);
    let orderBy: Prisma.CampaignOrderByWithRelationInput = { currentAmount: 'desc' };
    if (query.sort === 'Nejnovější') orderBy = { createdAt: 'desc' };
    if (query.sort === 'Cíl vzestupně') orderBy = { goalAmount: 'asc' };
    if (query.sort === 'Cíl sestupně') orderBy = { goalAmount: 'desc' };

    return this.prisma.campaign.findMany({ where, orderBy, include: this.withRelations() });
  }

  async getGoalBounds(query: CampaignQueryDto, requester: AuthUser | null) {
    const where = this.applyVisibility(this.buildWhere(query, false), requester);
    const result = await this.prisma.campaign.aggregate({ where, _min: { goalAmount: true }, _max: { goalAmount: true } });
    return { minGoal: result._min.goalAmount ?? 0, maxGoal: result._max.goalAmount ?? 0 };
  }

  findOne(id: string, requester: AuthUser | null) {
    const where = this.applyVisibility({ id }, requester);
    return this.prisma.campaign.findFirst({ where, include: this.withRelations() });
  }

  async create(data: CreateCampaignDto, requester: AuthUser) {
    const validated = this.validateCreate(data);
    return this.prisma.campaign.create({
      data: {
        title: validated.title,
        shortDesc: validated.shortDesc,
        story: validated.story,
        category: validated.category,
        goalAmount: validated.goalAmount,
        currentAmount: validated.currentAmount ?? 0,
        ownerKey: requester.username,
        ownerId: requester.id,
        coverImageUrl: validated.coverImageUrl,
        images: { create: validated.imageUrls.map((url, index) => ({ url, sortOrder: index })) },
        rewards: { create: validated.rewards.map((reward, index) => ({ ...reward, sortOrder: index })) },
      },
      include: this.withRelations(),
    });
  }

  async update(id: string, data: UpdateCampaignDto, requester: AuthUser) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });
    if (!existing) return null;
    if (requester.role !== UserRole.ADMIN && existing.ownerId !== requester.id) return null;

    const validated = this.validateUpdate(data);
    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.shortDesc !== undefined ? { shortDesc: validated.shortDesc } : {}),
        ...(validated.story !== undefined ? { story: validated.story } : {}),
        ...(validated.category !== undefined ? { category: validated.category } : {}),
        ...(validated.goalAmount !== undefined ? { goalAmount: validated.goalAmount } : {}),
        ...(validated.currentAmount !== undefined ? { currentAmount: validated.currentAmount } : {}),
        ...(validated.status !== undefined ? { status: validated.status } : {}),
        ...(validated.coverImageUrl !== undefined ? { coverImageUrl: validated.coverImageUrl } : {}),
        ...(validated.imageUrls !== undefined ? { images: { deleteMany: {}, create: validated.imageUrls.map((url, index) => ({ url, sortOrder: index })) } } : {}),
        ...(validated.rewards !== undefined ? { rewards: { deleteMany: {}, create: validated.rewards.map((reward, index) => ({ ...reward, sortOrder: index })) } } : {}),
      },
      include: this.withRelations(),
    });
  }

  submit(id: string, requester: AuthUser) {
    return this.update(id, { status: CampaignStatus.PENDING_REVIEW }, requester);
  }
}
