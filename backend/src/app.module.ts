import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  controllers: [CampaignsController, AuthController],
  providers: [CampaignsService, PrismaService, AuthService],
})
export class AppModule {}
