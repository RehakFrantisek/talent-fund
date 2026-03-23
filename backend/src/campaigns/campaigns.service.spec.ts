import { CampaignStatus, Category } from '@prisma/client';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService', () => {
  const mockPrisma = {
    campaign: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  const service = new CampaignsService(mockPrisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns campaign list with filters', async () => {
    const campaigns = [{ id: 'c1', title: 'Anna', category: Category.SPORT }];
    mockPrisma.campaign.findMany.mockResolvedValue(campaigns);

    const result = await service.findAll({ category: Category.SPORT, status: CampaignStatus.DRAFT, q: 'anna' }, null);

    expect(result).toEqual(campaigns);
    expect(mockPrisma.campaign.findMany).toHaveBeenCalled();
  });

  it('returns campaign detail by id', async () => {
    const campaign = { id: 'c1', title: 'Anna detail' };
    mockPrisma.campaign.findFirst.mockResolvedValue(campaign);

    const result = await service.findOne('c1', null);

    expect(result).toEqual(campaign);
    expect(mockPrisma.campaign.findFirst).toHaveBeenCalledWith({
      where: expect.any(Object),
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
  });
});
