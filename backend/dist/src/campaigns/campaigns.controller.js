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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsController = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const campaigns_service_1 = require("./campaigns.service");
const auth_service_1 = require("../auth/auth.service");
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
let CampaignsController = class CampaignsController {
    constructor(campaignsService, authService) {
        this.campaignsService = campaignsService;
        this.authService = authService;
    }
    async goalBounds(query, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        return this.campaignsService.getGoalBounds(query, requester);
    }
    async findAll(query, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        return this.campaignsService.findAll(query, requester);
    }
    async findOne(id, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        const campaign = await this.campaignsService.findOne(id, requester);
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async uploadImage(body, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        if (!requester)
            throw new common_1.UnauthorizedException('Pro upload se přihlaste.');
        if (!body.fileName || !body.data)
            throw new common_1.BadRequestException('Soubor je povinný.');
        const extension = (0, path_1.extname)(body.fileName).toLowerCase();
        if (!allowedExtensions.has(extension))
            throw new common_1.BadRequestException('Podporovány jsou pouze obrázky (JPG, PNG, WEBP, GIF, SVG).');
        const buffer = Buffer.from(body.data, 'base64');
        if (buffer.byteLength > 5 * 1024 * 1024)
            throw new common_1.BadRequestException('Soubor je příliš velký (max 5 MB).');
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(uploadDir, fileName), buffer);
        return { url: `/uploads/${fileName}` };
    }
    async create(body, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        if (!requester)
            throw new common_1.UnauthorizedException('Pro vytvoření projektu se přihlaste.');
        return this.campaignsService.create(body, requester);
    }
    async update(id, body, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        if (!requester)
            throw new common_1.UnauthorizedException('Pro editaci projektu se přihlaste.');
        if (body.status && requester.role !== client_1.UserRole.ADMIN)
            throw new common_1.ForbiddenException('Status může měnit pouze admin.');
        const campaign = await this.campaignsService.update(id, body, requester);
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async submit(id, authorization) {
        const requester = await this.authService.getUserFromAuthHeader(authorization);
        if (!requester)
            throw new common_1.UnauthorizedException('Pro odeslání projektu se přihlaste.');
        const campaign = await this.campaignsService.submit(id, requester);
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
};
exports.CampaignsController = CampaignsController;
__decorate([
    (0, common_1.Get)('goal-bounds'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "goalBounds", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload-image'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "submit", null);
exports.CampaignsController = CampaignsController = __decorate([
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [campaigns_service_1.CampaignsService,
        auth_service_1.AuthService])
], CampaignsController);
//# sourceMappingURL=campaigns.controller.js.map