import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(): {
        id: string;
        title: string;
        goalAmount: number;
        raisedAmount: number;
    }[];
    findOne(id: string): {
        id: string;
        title: string;
        goalAmount: number;
        raisedAmount: number;
    };
}
