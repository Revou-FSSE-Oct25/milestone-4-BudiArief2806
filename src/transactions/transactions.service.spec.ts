import { BadRequestException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const prismaMock = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const accountsServiceMock = {
    findAccessibleAccountOrThrow: jest.fn(),
  };

  let service: TransactionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionsService(prismaMock as any, accountsServiceMock as any);
  });

  it('rejects withdrawal when balance is insufficient', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(10000),
      currency: 'IDR',
    });

    await expect(
      service.withdraw(
        {
          sub: 1,
          email: 'budi@example.com',
          role: UserRole.USER,
        },
        {
          accountId: 1,
          amount: 15000,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects transfer when source and destination are the same account', async () => {
    await expect(
      service.transfer(
        {
          sub: 1,
          email: 'budi@example.com',
          role: UserRole.USER,
        },
        {
          sourceAccountId: 1,
          destinationAccountId: 1,
          amount: 5000,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a deposit transaction and returns the created data', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(10000),
      currency: 'IDR',
    });

    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        account: {
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 10,
            reference: 'TXN-123-ABCDEF',
            transactionType: 'DEPOSIT',
            status: 'COMPLETED',
            amount: new Prisma.Decimal(5000),
            description: 'Top up',
            performedById: 1,
            sourceAccountId: null,
            destinationAccountId: 1,
            createdAt: new Date('2026-04-10T00:00:00.000Z'),
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            sourceAccount: null,
            destinationAccount: {
              accountNumber: '101234567890',
            },
          }),
        },
      }),
    );

    const result = await service.deposit(
      {
        sub: 1,
        email: 'budi@example.com',
        role: UserRole.USER,
      },
      {
        accountId: 1,
        amount: 5000,
        description: 'Top up',
      },
    );

    expect(result.amount).toBe(5000);
    expect(result.destinationAccountId).toBe(1);
    expect(result.destinationAccountNumber).toBe('101234567890');
  });
});
