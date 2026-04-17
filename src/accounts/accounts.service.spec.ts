import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AccountsService } from './accounts.service';

// Test AccountsService memeriksa aturan akses dan aturan hapus rekening.
describe('AccountsService', () => {
  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: UserRole.USER,
  };

  const prismaMock = {
    account: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  };

  let service: AccountsService;

  beforeEach(() => {
    // Bersihkan seluruh mock agar setiap skenario dimulai dari kondisi bersih.
    jest.clearAllMocks();
    service = new AccountsService(prismaMock as any);
  });

  it('creates an account and normalizes currency to uppercase', async () => {
    prismaMock.account.findUnique.mockResolvedValueOnce(null);
    prismaMock.account.create.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Main Wallet',
      accountType: 'SAVINGS',
      currency: 'USD',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createAccount(currentUser, {
      accountName: 'Main Wallet',
      accountType: 'SAVINGS' as any,
      currency: 'usd',
    });

    expect(result.currency).toBe('USD');
    expect(prismaMock.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 1,
          currency: 'USD',
        }),
      }),
    );
  });

  it('returns only user accounts for a normal user', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        accountNumber: '101234567890',
        accountName: 'Main Wallet',
        accountType: 'SAVINGS',
        currency: 'IDR',
        balance: new Prisma.Decimal(1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.findAll(currentUser);

    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 },
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('returns all accounts for an admin user', async () => {
    prismaMock.account.findMany.mockResolvedValue([]);

    await service.findAll({
      sub: 99,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    expect(prismaMock.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it('updates an account and normalizes currency', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Main',
      accountType: 'SAVINGS',
      currency: 'IDR',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.account.update.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Updated Wallet',
      accountType: 'CHECKING',
      currency: 'USD',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.update(1, currentUser, {
      accountName: 'Updated Wallet',
      accountType: 'CHECKING' as any,
      currency: 'usd',
    });

    expect(result.accountName).toBe('Updated Wallet');
    expect(result.currency).toBe('USD');
  });

  it('rejects deleting an account with a positive balance', async () => {
    // Akun dengan saldo positif tidak boleh dihapus.
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
      service.remove(1, currentUser),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects deleting an account with transaction history', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Main',
      accountType: 'SAVINGS',
      currency: 'IDR',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.transaction.count.mockResolvedValue(3);

    await expect(service.remove(1, currentUser)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deletes an account successfully when business rules are satisfied', async () => {
    prismaMock.account.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      accountNumber: '101234567890',
      accountName: 'Main',
      accountType: 'SAVINGS',
      currency: 'IDR',
      balance: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.transaction.count.mockResolvedValue(0);
    prismaMock.account.delete.mockResolvedValue({ id: 1 });

    const result = await service.remove(1, currentUser);

    expect(result).toEqual({ message: 'Account deleted successfully.' });
  });

  it('rejects accessing another users account when requester is not admin', async () => {
    // User biasa tidak boleh mengakses account milik user lain.
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
      service.findAccessibleAccountOrThrow(1, currentUser),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an admin to access another users account', async () => {
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

    const result = await service.findAccessibleAccountOrThrow(1, {
      sub: 99,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    expect(result.userId).toBe(2);
  });
});
