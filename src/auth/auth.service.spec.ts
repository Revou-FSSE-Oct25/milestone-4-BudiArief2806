import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

// Test AuthService fokus pada aturan registrasi dan login yang paling penting.
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
    // Reset seluruh mock sebelum setiap test agar hasil test saling tidak mempengaruhi.
    jest.clearAllMocks();
    service = new AuthService(prismaMock as any, jwtServiceMock as JwtService);
  });

  it('registers a new user and returns the created profile without a token', async () => {
    // Simulasikan email belum dipakai sehingga registrasi boleh lanjut.
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: 1,
      fullName: data.fullName,
      callme: data.callme ?? null,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone ?? null,
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    }));

    const result = await service.register({
      fullName: 'Budi Santoso',
      callme: 'Sanu',
      email: 'budi@example.com',
      password: 'SecurePass123',
      phone: '+628123456789',
    });

    expect(result.email).toBe('budi@example.com');
    expect(result.callme).toBe('Sanu');
    expect((result as any).accessToken).toBeUndefined();
    expect(prismaMock.user.create).toHaveBeenCalled();

    // Pastikan password yang disimpan bukan password plain text.
    const createdPasswordHash = prismaMock.user.create.mock.calls[0][0].data.passwordHash;
    expect(createdPasswordHash).not.toBe('SecurePass123');
  });

  it('rejects registration when email already exists', async () => {
    // Simulasikan email sudah terdaftar.
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
    // Simulasikan user ditemukan tetapi hash password tidak cocok.
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      fullName: 'Budi Santoso',
      callme: null,
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

  it('returns a JWT response when login credentials are valid', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123', 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      fullName: 'Budi Santoso',
      callme: 'Sanu',
      email: 'budi@example.com',
      passwordHash,
      phone: '+628123456789',
      role: UserRole.USER,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });

    const result = await service.login({
      email: 'budi@example.com',
      password: 'SecurePass123',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.email).toBe('budi@example.com');
  });

  it('rejects login when the user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'SecurePass123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
