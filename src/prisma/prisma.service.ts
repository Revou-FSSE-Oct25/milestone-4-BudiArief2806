import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// PrismaService membungkus PrismaClient agar mudah dipakai via dependency injection NestJS.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    // Prisma 7 menggunakan driver adapter eksplisit untuk koneksi database.
    const connectionString =
      configService.get<string>('DATABASE_URL') ??
      'postgresql://postgres:postgres@localhost:5432/milstone4?schema=public';
    // Adapter PostgreSQL diperlukan oleh Prisma 7 untuk koneksi langsung ke database.
    const adapter = new PrismaPg(connectionString);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    // Saat aplikasi boot, Prisma langsung mencoba koneksi agar error database
    // muncul lebih awal dan tidak baru terlihat ketika endpoint dipanggil.
    await this.$connect();
  }
}
