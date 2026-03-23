import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { UserRole } from '@prisma/client';
import { CampaignsService } from './campaigns.service';
import { CampaignQueryDto, CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { AuthService } from '../auth/auth.service';

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly authService: AuthService,
  ) {}

  @Get('goal-bounds')
  async goalBounds(@Query() query: CampaignQueryDto, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    return this.campaignsService.getGoalBounds(query, requester);
  }

  @Get()
  async findAll(@Query() query: CampaignQueryDto, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    return this.campaignsService.findAll(query, requester);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    const campaign = await this.campaignsService.findOne(id, requester);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  @Post('upload-image')
  async uploadImage(@Body() body: { fileName?: string; data?: string }, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    if (!requester) throw new UnauthorizedException('Pro upload se přihlaste.');

    if (!body.fileName || !body.data) throw new BadRequestException('Soubor je povinný.');
    const extension = extname(body.fileName).toLowerCase();
    if (!allowedExtensions.has(extension)) throw new BadRequestException('Podporovány jsou pouze obrázky (JPG, PNG, WEBP, GIF, SVG).');

    const buffer = Buffer.from(body.data, 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) throw new BadRequestException('Soubor je příliš velký (max 5 MB).');

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const uploadDir = join(process.cwd(), 'uploads');
    mkdirSync(uploadDir, { recursive: true });
    writeFileSync(join(uploadDir, fileName), buffer);
    return { url: `/uploads/${fileName}` };
  }

  @Post()
  async create(@Body() body: CreateCampaignDto, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    if (!requester) throw new UnauthorizedException('Pro vytvoření projektu se přihlaste.');
    return this.campaignsService.create(body, requester);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCampaignDto, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    if (!requester) throw new UnauthorizedException('Pro editaci projektu se přihlaste.');
    if (body.status && requester.role !== UserRole.ADMIN) throw new ForbiddenException('Status může měnit pouze admin.');

    const campaign = await this.campaignsService.update(id, body, requester);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const requester = await this.authService.getUserFromAuthHeader(authorization);
    if (!requester) throw new UnauthorizedException('Pro odeslání projektu se přihlaste.');

    const campaign = await this.campaignsService.submit(id, requester);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }
}
