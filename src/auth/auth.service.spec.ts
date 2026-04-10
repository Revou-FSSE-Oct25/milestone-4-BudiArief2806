import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prismaMock as any, jwtServiceMock as JwtService);
  });

  it('registers a new user and returns a JWT response', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: 1,
      fullName: data.fullName,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone ?? null,
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    }));

    const result = await service.register({
      fullName: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'SecurePass123',
      phone: '+628123456789',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.tokenType).toBe('Bearer');
    expect(result.user.email).toBe('budi@example.com');
    expect(prismaMock.user.create).toHaveBeenCalled();

    const createdPasswordHash = prismaMock.user.create.mock.calls[0][0].data.passwordHash;
    expect(createdPasswordHash).not.toBe('SecurePass123');
  });

  it('rejects registration when email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 99 });

    await expect(
      service.register({
        fullName: 'Budi Santoso',
        email: 'budi@example.com',
        password: 'SecurePass123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects login when password is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      fullName: 'Budi Santoso',
      email: 'budi@example.com',
      passwordHash:
        '$2b$10$4Ck8xn8JzU1k8A5Fg8zJVuCC6f2XS0L4xI9x0q6YY6x6Y9m0QkSC6',
      phone: null,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({
        email: 'budi@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
