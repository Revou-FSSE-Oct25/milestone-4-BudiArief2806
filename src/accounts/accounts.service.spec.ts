import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const prismaMock = {
    account: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  };

  let service: AccountsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountsService(prismaMock as any);
  });

  it('rejects deleting an account with a positive balance', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Main',
      accountType: 'SAVINGS',
      currency: 'IDR',
      balance: new Prisma.Decimal(50000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.remove(1, {
        sub: 1,
        email: 'budi@example.com',
        role: UserRole.USER,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects accessing another users account when requester is not admin', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 1,
      userId: 2,
      accountNumber: '101234567890',
      accountName: 'Main',
      accountType: 'SAVINGS',
      currency: 'IDR',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.findAccessibleAccountOrThrow(1, {
        sub: 1,
        email: 'budi@example.com',
        role: UserRole.USER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
