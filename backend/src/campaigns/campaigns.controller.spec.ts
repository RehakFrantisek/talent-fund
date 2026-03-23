import { NotFoundException } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';

describe('CampaignsController', () => {
  const service = {
    getGoalBounds: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    submit: jest.fn(),
  };

  const authService = {
    getUserFromAuthHeader: jest.fn().mockResolvedValue(null),
  };

  const controller = new CampaignsController(service as never, authService as never);

  beforeEach(() => {
    jest.clearAllMocks();
    authService.getUserFromAuthHeader.mockResolvedValue(null);
  });

  it('returns list', async () => {
    const list = [{ id: 'c1' }];
    service.findAll.mockResolvedValue(list);

    const result = await controller.findAll({}, undefined);

    expect(result).toEqual(list);
  });

  it('throws when detail is missing', async () => {
    service.findOne.mockResolvedValue(null);

    await expect(controller.findOne('missing', undefined)).rejects.toThrow(NotFoundException);
  });
});
