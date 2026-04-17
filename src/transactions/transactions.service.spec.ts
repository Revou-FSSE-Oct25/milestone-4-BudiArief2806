import { BadRequestException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { TransactionsService } from './transactions.service';

// Test TransactionsService fokus ke aturan bisnis saldo dan transfer.
describe('TransactionsService', () => {
  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: UserRole.USER,
  };

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
    // Reset mock sebelum test berikutnya dimulai.
    jest.clearAllMocks();
    service = new TransactionsService(prismaMock as any, accountsServiceMock as any);
  });

  it('rejects withdrawal when balance is insufficient', async () => {
    // Simulasikan saldo account lebih kecil dari nominal withdraw.
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(10000),
      currency: 'IDR',
    });

    await expect(
      service.withdraw(
        currentUser,
        {
          accountId: 1,
          amount: 15000,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects transfer when source and destination are the same account', async () => {
    // Transfer ke account yang sama harus ditolak sejak awal.
    await expect(
      service.transfer(
        currentUser,
        {
          sourceAccountId: 1,
          destinationAccountId: 1,
          amount: 5000,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a deposit transaction and returns the created data', async () => {
    // Simulasikan account valid milik user yang sedang login.
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(10000),
      currency: 'IDR',
    });

    prismaMock.$transaction.mockImplementation(async (callback) =>
      // Mock prisma.$transaction agar kita bisa menguji alur transaksi atomik
      // tanpa harus benar-benar tersambung ke database.
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
            adminFee: new Prisma.Decimal(0),
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
      currentUser,
      {
        accountId: 1,
        amount: 5000,
        description: 'Top up',
      },
    );

    // Pastikan response yang dikembalikan sudah ditransformasi ke bentuk API.
    expect(result.amount).toBe(5000);
    expect(result.adminFee).toBe(0);
    expect(result.destinationAccountId).toBe(1);
    expect(result.destinationAccountNumber).toBe('101234567890');
  });

  it('creates a withdraw transaction when the balance is sufficient', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(20000),
      currency: 'IDR',
    });

    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        account: {
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 11,
            reference: 'TXN-456-ABCDEF',
            transactionType: 'WITHDRAW',
            status: 'COMPLETED',
            amount: new Prisma.Decimal(5000),
            adminFee: new Prisma.Decimal(0),
            description: 'Tarik tunai',
            performedById: 1,
            sourceAccountId: 1,
            destinationAccountId: null,
            createdAt: new Date('2026-04-10T00:00:00.000Z'),
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            sourceAccount: {
              accountNumber: '101234567890',
            },
            destinationAccount: null,
          }),
        },
      }),
    );

    const result = await service.withdraw(currentUser, {
      accountId: 1,
      amount: 5000,
      description: 'Tarik tunai',
    });

    expect(result.sourceAccountId).toBe(1);
    expect(result.adminFee).toBe(0);
    expect(result.sourceAccountNumber).toBe('101234567890');
  });

  it('rejects transfer when destination account is missing', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(50000),
      currency: 'IDR',
    });
    prismaMock.account.findUnique.mockResolvedValue(null);

    await expect(
      service.transfer(currentUser, {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 1000,
      }),
    ).rejects.toThrow('Destination account was not found.');
  });

  it('rejects transfer between different currencies', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(50000),
      currency: 'IDR',
    });
    prismaMock.account.findUnique.mockResolvedValue({
      id: 2,
      userId: 2,
      balance: new Prisma.Decimal(1000),
      currency: 'USD',
    });

    await expect(
      service.transfer(currentUser, {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects transfer when the source balance is insufficient', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(1000),
      currency: 'IDR',
    });
    prismaMock.account.findUnique.mockResolvedValue({
      id: 2,
      userId: 2,
      balance: new Prisma.Decimal(1000),
      currency: 'IDR',
    });

    await expect(
      service.transfer(currentUser, {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 5000,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a transfer transaction when request is valid', async () => {
    accountsServiceMock.findAccessibleAccountOrThrow.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: new Prisma.Decimal(50000),
      currency: 'IDR',
    });
    prismaMock.account.findUnique.mockResolvedValue({
      id: 2,
      userId: 2,
      balance: new Prisma.Decimal(1000),
      currency: 'IDR',
    });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        account: {
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 12,
            reference: 'TXN-789-ABCDEF',
            transactionType: 'TRANSFER',
            status: 'COMPLETED',
            amount: new Prisma.Decimal(10000),
            adminFee: new Prisma.Decimal(2000),
            description: 'Kirim uang',
            performedById: 1,
            sourceAccountId: 1,
            destinationAccountId: 2,
            createdAt: new Date('2026-04-10T00:00:00.000Z'),
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            sourceAccount: {
              accountNumber: '101234567890',
            },
            destinationAccount: {
              accountNumber: '109876543210',
            },
          }),
        },
      }),
    );

    const result = await service.transfer(currentUser, {
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: 10000,
      description: 'Kirim uang',
    });

    expect(result.sourceAccountNumber).toBe('101234567890');
    expect(result.destinationAccountNumber).toBe('109876543210');
    expect(result.adminFee).toBe(2000);
  });

  it('returns all transactions visible to a normal user', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: 1,
        reference: 'TXN-123-ABCDEF',
        transactionType: 'DEPOSIT',
        status: 'COMPLETED',
        amount: new Prisma.Decimal(5000),
        adminFee: new Prisma.Decimal(0),
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
      },
    ]);

    const result = await service.findAll(currentUser);

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('returns all transactions for an admin without visibility filters', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([]);

    await service.findAll({
      sub: 9,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it('returns a visible transaction detail', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 2,
      reference: 'TXN-222-ABCDEF',
      transactionType: 'TRANSFER',
      status: 'COMPLETED',
      amount: new Prisma.Decimal(7500),
      adminFee: new Prisma.Decimal(2000),
      description: 'Transfer',
      performedById: 1,
      sourceAccountId: 1,
      destinationAccountId: 2,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
      sourceAccount: {
        accountNumber: '101234567890',
      },
      destinationAccount: {
        accountNumber: '109876543210',
      },
    });

    const result = await service.findOne(2, currentUser);

    expect(result.id).toBe(2);
    expect(result.destinationAccountNumber).toBe('109876543210');
  });

  it('throws when a transaction detail is not visible', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue(null);

    await expect(service.findOne(99, currentUser)).rejects.toThrow(
      'Transaction was not found.',
    );
  });
});
