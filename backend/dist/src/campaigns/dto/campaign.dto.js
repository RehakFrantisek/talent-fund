"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignValidation = void 0;
exports.campaignValidation = {
    title: { min: 5, max: 120 },
    shortDesc: { min: 20, max: 240 },
    story: { min: 50, max: 5000 },
    goalAmount: { min: 1000, max: 100000000 },
    image: { maxCount: 5 },
    reward: { maxCount: 10, titleMin: 3, titleMax: 80, descriptionMin: 3, descriptionMax: 400, amountMin: 1, amountMax: 100000000 },
};
//# sourceMappingURL=campaign.dto.js.map