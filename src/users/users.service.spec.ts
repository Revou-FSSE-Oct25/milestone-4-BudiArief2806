import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: UserRole.USER,
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prismaMock as any);
  });

  it('returns the authenticated user profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'budi@example.com',
      fullName: 'Budi Santoso',
      callme: 'Sanu',
      phone: '+628123456789',
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });

    const result = await service.getProfile(currentUser);

    expect(result.email).toBe('budi@example.com');
    expect(result.fullName).toBe('Budi Santoso');
  });

  it('throws when the profile is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getProfile(currentUser)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and returns the authenticated user profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'budi@example.com',
      fullName: 'Budi Santoso',
      callme: 'Sanu',
      phone: '+628123456789',
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });
    prismaMock.user.update.mockResolvedValue({
      id: 1,
      email: 'budi@example.com',
      fullName: 'Budi Santoso Updated',
      callme: 'Sanu Updated',
      phone: '+628123456780',
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-11T00:00:00.000Z'),
    });

    const result = await service.updateProfile(currentUser, {
      fullName: 'Budi Santoso Updated',
      callme: 'Sanu Updated',
      phone: '+628123456780',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
      }),
    );
    expect(result.fullName).toBe('Budi Santoso Updated');
    expect(result.callme).toBe('Sanu Updated');
  });

  it('throws when updating a missing profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.updateProfile(currentUser, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
