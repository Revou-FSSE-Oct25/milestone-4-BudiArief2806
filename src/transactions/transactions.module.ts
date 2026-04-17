import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

// TransactionsModule menangani seluruh alur transaksi saldo:
// deposit, withdraw, transfer, dan riwayat transaksi.
@Module({
  imports: [PrismaModule, AccountsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
