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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(body) {
        return this.authService.register(body);
    }
    login(body) {
        return this.authService.login(body);
    }
    profiles() {
        return this.authService.getPublicProfiles();
    }
    async profileById(id) {
        const user = await this.authService.getPublicProfileById(id);
        if (!user)
            throw new common_1.NotFoundException('Profil nebyl nalezen.');
        return user;
    }
    async me(authorization) {
        const user = await this.authService.getUserFromAuthHeader(authorization);
        if (!user)
            throw new common_1.UnauthorizedException('Nejste přihlášeni.');
        return user;
    }
    async updateMe(body, authorization) {
        const user = await this.authService.getUserFromAuthHeader(authorization);
        if (!user)
            throw new common_1.UnauthorizedException('Nejste přihlášeni.');
        return this.authService.updateProfile(user.id, { ...body, role: undefined });
    }
    async listUsers(authorization) {
        const user = await this.authService.getUserFromAuthHeader(authorization);
        if (!user)
            throw new common_1.UnauthorizedException('Nejste přihlášeni.');
        if (user.role !== client_1.UserRole.ADMIN)
            throw new common_1.ForbiddenException('Pouze pro admina.');
        return this.authService.listUsersForAdmin();
    }
    async updateUser(id, body, authorization) {
        const user = await this.authService.getUserFromAuthHeader(authorization);
        if (!user)
            throw new common_1.UnauthorizedException('Nejste přihlášeni.');
        if (user.role !== client_1.UserRole.ADMIN)
            throw new common_1.ForbiddenException('Pouze pro admina.');
        return this.authService.updateUserForAdmin(id, body);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profiles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profiles", null);
__decorate([
    (0, common_1.Get)('profiles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "profileById", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('admin/users'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map