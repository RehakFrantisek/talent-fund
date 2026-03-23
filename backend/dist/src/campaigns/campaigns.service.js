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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const campaign_dto_1 = require("./dto/campaign.dto");
const validCategories = new Set(Object.values(client_1.Category));
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(query, includeGoalRange = true) {
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
    applyVisibility(where, requester) {
        if (requester?.role === client_1.UserRole.ADMIN)
            return where;
        const visibility = requester ? { OR: [{ status: client_1.CampaignStatus.APPROVED }, { ownerId: requester.id }] } : {};
        return { AND: [where, visibility] };
    }
    withRelations() {
        return {
            images: { orderBy: { sortOrder: 'asc' } },
            rewards: { orderBy: { sortOrder: 'asc' } },
        };
    }
    normalizeString(value, field, min, max) {
        if (typeof value !== 'string')
            throw new common_1.BadRequestException(`${field} musí být text.`);
        const trimmed = value.trim();
        if (!trimmed)
            throw new common_1.BadRequestException(`${field} je povinné pole.`);
        if (trimmed.length < min || trimmed.length > max)
            throw new common_1.BadRequestException(`${field} musí mít ${min} až ${max} znaků.`);
        return trimmed;
    }
    normalizeGoal(value) {
        if (typeof value !== 'number' || !Number.isInteger(value))
            throw new common_1.BadRequestException('Cílová částka musí být celé číslo.');
        if (value < campaign_dto_1.campaignValidation.goalAmount.min || value > campaign_dto_1.campaignValidation.goalAmount.max) {
            throw new common_1.BadRequestException(`Cílová částka musí být mezi ${campaign_dto_1.campaignValidation.goalAmount.min} a ${campaign_dto_1.campaignValidation.goalAmount.max}.`);
        }
        return value;
    }
    normalizeImageUrls(value) {
        if (value === undefined)
            return undefined;
        if (!Array.isArray(value))
            throw new common_1.BadRequestException('Obrázky musí být pole URL adres.');
        if (value.length > campaign_dto_1.campaignValidation.image.maxCount)
            throw new common_1.BadRequestException(`Můžete uložit maximálně ${campaign_dto_1.campaignValidation.image.maxCount} obrázků.`);
        return value
            .map((item, index) => {
            if (typeof item !== 'string' || !item.trim())
                throw new common_1.BadRequestException(`Obrázek na pozici ${index + 1} není platná URL.`);
            return item.trim();
        })
            .filter((url) => {
            const cleanUrl = url.split('?')[0].split('#')[0] ?? '';
            const extension = (0, path_1.extname)(cleanUrl).toLowerCase();
            return !extension || allowedImageExtensions.has(extension);
        });
    }
    normalizeRewards(value) {
        if (value === undefined)
            return undefined;
        if (!Array.isArray(value))
            throw new common_1.BadRequestException('Odměny musí být pole.');
        if (value.length > campaign_dto_1.campaignValidation.reward.maxCount)
            throw new common_1.BadRequestException(`Můžete uložit maximálně ${campaign_dto_1.campaignValidation.reward.maxCount} odměn.`);
        return value.map((item, index) => {
            if (!item || typeof item !== 'object')
                throw new common_1.BadRequestException(`Odměna na pozici ${index + 1} není platná.`);
            const reward = item;
            const title = this.normalizeString(reward.title, `Název odměny #${index + 1}`, campaign_dto_1.campaignValidation.reward.titleMin, campaign_dto_1.campaignValidation.reward.titleMax);
            const description = this.normalizeString(reward.description, `Popis odměny #${index + 1}`, campaign_dto_1.campaignValidation.reward.descriptionMin, campaign_dto_1.campaignValidation.reward.descriptionMax);
            const imageUrl = typeof reward.imageUrl === 'string' ? reward.imageUrl.trim() : '';
            if (reward.imageUrl !== undefined && reward.imageUrl !== null && typeof reward.imageUrl !== 'string') {
                throw new common_1.BadRequestException(`Obrázek odměny #${index + 1} musí být URL adresa.`);
            }
            if (imageUrl) {
                const cleanUrl = imageUrl.split('?')[0].split('#')[0] ?? '';
                const extension = (0, path_1.extname)(cleanUrl).toLowerCase();
                if (extension && !allowedImageExtensions.has(extension)) {
                    throw new common_1.BadRequestException(`Obrázek odměny #${index + 1} musí být JPG, PNG, WEBP, GIF nebo SVG.`);
                }
            }
            if (typeof reward.amount !== 'number' || !Number.isInteger(reward.amount)) {
                throw new common_1.BadRequestException(`Částka odměny #${index + 1} musí být celé číslo.`);
            }
            if (reward.amount < campaign_dto_1.campaignValidation.reward.amountMin || reward.amount > campaign_dto_1.campaignValidation.reward.amountMax) {
                throw new common_1.BadRequestException(`Částka odměny #${index + 1} je mimo povolený rozsah.`);
            }
            return { title, description, amount: reward.amount, imageUrl: imageUrl || null };
        });
    }
    validateCreate(data) {
        const title = this.normalizeString(data.title, 'Název projektu', campaign_dto_1.campaignValidation.title.min, campaign_dto_1.campaignValidation.title.max);
        const shortDesc = this.normalizeString(data.shortDesc, 'Krátký popis', campaign_dto_1.campaignValidation.shortDesc.min, campaign_dto_1.campaignValidation.shortDesc.max);
        const story = this.normalizeString(data.story, 'Podrobný popis', campaign_dto_1.campaignValidation.story.min, campaign_dto_1.campaignValidation.story.max);
        const goalAmount = this.normalizeGoal(data.goalAmount);
        if (!validCategories.has(data.category))
            throw new common_1.BadRequestException('Kategorie projektu není platná.');
        const imageUrls = this.normalizeImageUrls(data.imageUrls ?? (data.coverImageUrl ? [data.coverImageUrl] : [])) ?? [];
        const rewards = this.normalizeRewards(data.rewards) ?? [];
        return { ...data, title, shortDesc, story, goalAmount, imageUrls, rewards, coverImageUrl: imageUrls[0] ?? null };
    }
    validateUpdate(data) {
        const validated = { ...data };
        if (data.title !== undefined)
            validated.title = this.normalizeString(data.title, 'Název projektu', campaign_dto_1.campaignValidation.title.min, campaign_dto_1.campaignValidation.title.max);
        if (data.shortDesc !== undefined)
            validated.shortDesc = this.normalizeString(data.shortDesc, 'Krátký popis', campaign_dto_1.campaignValidation.shortDesc.min, campaign_dto_1.campaignValidation.shortDesc.max);
        if (data.story !== undefined)
            validated.story = this.normalizeString(data.story, 'Podrobný popis', campaign_dto_1.campaignValidation.story.min, campaign_dto_1.campaignValidation.story.max);
        if (data.goalAmount !== undefined)
            validated.goalAmount = this.normalizeGoal(data.goalAmount);
        if (data.category !== undefined && !validCategories.has(data.category))
            throw new common_1.BadRequestException('Kategorie projektu není platná.');
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
    findAll(query, requester) {
        const where = this.applyVisibility(this.buildWhere(query), requester);
        let orderBy = { currentAmount: 'desc' };
        if (query.sort === 'Nejnovější')
            orderBy = { createdAt: 'desc' };
        if (query.sort === 'Cíl vzestupně')
            orderBy = { goalAmount: 'asc' };
        if (query.sort === 'Cíl sestupně')
            orderBy = { goalAmount: 'desc' };
        return this.prisma.campaign.findMany({ where, orderBy, include: this.withRelations() });
    }
    async getGoalBounds(query, requester) {
        const where = this.applyVisibility(this.buildWhere(query, false), requester);
        const result = await this.prisma.campaign.aggregate({ where, _min: { goalAmount: true }, _max: { goalAmount: true } });
        return { minGoal: result._min.goalAmount ?? 0, maxGoal: result._max.goalAmount ?? 0 };
    }
    findOne(id, requester) {
        const where = this.applyVisibility({ id }, requester);
        return this.prisma.campaign.findFirst({ where, include: this.withRelations() });
    }
    async create(data, requester) {
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
    async update(id, data, requester) {
        const existing = await this.prisma.campaign.findUnique({ where: { id } });
        if (!existing)
            return null;
        if (requester.role !== client_1.UserRole.ADMIN && existing.ownerId !== requester.id)
            return null;
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
    submit(id, requester) {
        return this.update(id, { status: client_1.CampaignStatus.PENDING_REVIEW }, requester);
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map