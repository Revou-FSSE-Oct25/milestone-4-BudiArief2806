import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ConfigModule dibuat global supaya DATABASE_URL, JWT_SECRET, dan PORT
    // bisa dipakai di seluruh aplikasi tanpa import ulang di setiap module.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
  ],
  providers: [
    // Semua route dianggap private secara default.
    // Hanya route yang diberi decorator @Public() yang bisa diakses tanpa token.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // RolesGuard disiapkan supaya logic role-based access bisa dipakai saat dibutuhkan.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
