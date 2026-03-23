export declare class CampaignsService {
    private campaigns;
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
    } | undefined;
}
