import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const campaign = this.campaignsService.findOne(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }
}
