"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
let CampaignsService = class CampaignsService {
    constructor() {
        this.campaigns = [
            { id: 'c1', title: 'Anna: Cesta na turnaj', goalAmount: 100000, raisedAmount: 42000 },
            { id: 'c2', title: 'Marek: Nákup vybavení', goalAmount: 120000, raisedAmount: 50000 },
        ];
    }
    findAll() {
        return this.campaigns;
    }
    findOne(id) {
        return this.campaigns.find((item) => item.id === id);
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)()
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map