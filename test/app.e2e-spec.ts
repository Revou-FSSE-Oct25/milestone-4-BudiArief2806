import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// E2E test ini meniru alur nyata dari luar aplikasi:
// kirim request HTTP lalu cek response yang keluar.
describe('Banking API (e2e)', () => {
  let app;

  const createPrismaMock = () => {
    // Array in-memory ini menggantikan database sungguhan selama test berjalan.
    const users: Array<{
      id: number;
      fullName: string;
      callme: string | null;
      email: string;
      passwordHash: string;
      phone: string | null;
      role: UserRole;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const accounts: Array<{
      id: number;
      userId: number;
      accountNumber: string;
      accountName: string;
      accountType: string;
      currency: string;
      balance: Prisma.Decimal;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    return {
      user: {
        findUnique: jest.fn(async ({ where }) => {
          // Cari user berdasarkan email atau id sesuai kebutuhan service.
          if (where.email) {
            return users.find((user) => user.email === where.email) ?? null;
          }

          if (where.id) {
            return users.find((user) => user.id === where.id) ?? null;
          }

          return null;
        }),
        create: jest.fn(async ({ data }) => {
          // Simulasikan insert user baru ke database.
          const user = {
            id: users.length + 1,
            fullName: data.fullName,
            callme: data.callme ?? null,
            email: data.email,
            passwordHash: data.passwordHash,
            phone: data.phone ?? null,
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          users.push(user);
          return user;
        }),
        update: jest.fn(async ({ where, data }) => {
          // Simulasikan update profile user.
          const user = users.find((item) => item.id === where.id);

          if (!user) {
            return null;
          }

          user.fullName = data.fullName ?? user.fullName;
          user.callme = data.callme ?? user.callme;
          user.phone = data.phone ?? user.phone;
          user.updatedAt = new Date();

          return user;
        }),
      },
      account: {
        findUnique: jest.fn(async ({ where }) => {
          // Mock pencarian account berdasarkan id atau nomor rekening.
          if (where.id) {
            return accounts.find((account) => account.id === where.id) ?? null;
          }

          if (where.accountNumber) {
            return (
              accounts.find((account) => account.accountNumber === where.accountNumber) ??
              null
            );
          }

          return null;
        }),
        create: jest.fn(async ({ data }) => {
          // Simulasikan pembuatan rekening baru dengan saldo awal 0.
          const account = {
            id: accounts.length + 1,
            userId: data.userId,
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            accountType: data.accountType,
            currency: data.currency,
            balance: new Prisma.Decimal(0),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          accounts.push(account);
          return account;
        }),
        findMany: jest.fn(async ({ where }) => {
          // Bila tidak ada filter, kembalikan semua data yang tersimpan di memori.
          if (!where || Object.keys(where).length === 0) {
            return accounts;
          }

          return accounts.filter((account) => account.userId === where.userId);
        }),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
        count: jest.fn(async () => 0),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
    };
  };

  beforeEach(async () => {
    // Buat mock Prisma baru untuk setiap test agar datanya tidak bercampur.
    const prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    // Inisialisasi Nest app seperti saat aplikasi benar-benar berjalan.
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    // Tutup aplikasi agar resource test bersih.
    await app.close();
  });

  it('registers, logs in, and returns the authenticated profile', async () => {
    // Skenario end-to-end utama: register lalu login lalu ambil profile.
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Budi Santoso',
        callme: 'Sanu',
        email: 'budi@example.com',
        password: 'SecurePass123',
        phone: '+628123456789',
      })
      .expect(201);

    expect(registerResponse.body.email).toBe('budi@example.com');
    expect(registerResponse.body.accessToken).toBeUndefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'budi@example.com',
        password: 'SecurePass123',
      })
      .expect(200);

    const profileResponse = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe('budi@example.com');
    expect(profileResponse.body.fullName).toBe('Budi Santoso');
  });

  it('returns 400 when register payload is invalid', async () => {
    // Validasi DTO harus menolak payload register yang salah.
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Bo',
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);
  });

  it('returns 401 when accessing profile without a token', async () => {
    // Route private harus menolak request tanpa JWT.
    await request(app.getHttpServer()).get('/user/profile').expect(401);
  });

  it('creates an account for an authenticated user', async () => {
    // Skenario ini memastikan auth + pembuatan account berjalan bersama-sama.
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Budi Santoso',
        email: 'budi@example.com',
        password: 'SecurePass123',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'budi@example.com',
        password: 'SecurePass123',
      })
      .expect(200);

    const accountResponse = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        accountName: 'Primary Savings',
        accountType: 'SAVINGS',
        currency: 'IDR',
      })
      .expect(201);

    expect(accountResponse.body.accountName).toBe('Primary Savings');
    expect(accountResponse.body.accountNumber).toMatch(/^10/);
    expect(accountResponse.body.balance).toBe(0);
  });
});
