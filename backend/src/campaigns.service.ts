import { Injectable } from '@nestjs/common';

@Injectable()
export class CampaignsService {
  private campaigns = [
    { id: 'c1', title: 'Anna: Cesta na turnaj', goalAmount: 100000, raisedAmount: 42000 },
    { id: 'c2', title: 'Marek: Nákup vybavení', goalAmount: 120000, raisedAmount: 50000 },
  ];

  findAll() {
    return this.campaigns;
  }

  findOne(id: string) {
    return this.campaigns.find((item) => item.id === id);
  }
}
