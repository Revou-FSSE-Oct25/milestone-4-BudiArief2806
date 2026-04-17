import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionStatus, TransactionType, UserRole } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';

// TransactionsService mengatur semua mutasi saldo dan histori transaksi.
@Injectable()
export class TransactionsService {
  // Setiap transfer dikenakan biaya admin tetap sebesar 2000.
  private static readonly TRANSFER_ADMIN_FEE = new Prisma.Decimal(2000);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  async deposit(currentUser: AuthenticatedUser, dto: DepositDto) {
    // Account tujuan deposit harus bisa diakses oleh user yang login.
    const account = await this.accountsService.findAccessibleAccountOrThrow(
      dto.accountId,
      currentUser,
    );
    const amount = new Prisma.Decimal(dto.amount);

    // Deposit harus menaikkan saldo account dan mencatat histori dalam satu transaksi database.
    const result = await this.prisma.$transaction(async (transactionClient) => {
      const updatedAccount = await transactionClient.account.update({
        where: { id: account.id },
        data: {
          balance: account.balance.plus(amount),
        },
      });

      const createdTransaction = await transactionClient.transaction.create({
        data: {
          reference: this.generateReference(),
          transactionType: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount,
          // Deposit tidak dikenakan biaya admin.
          adminFee: new Prisma.Decimal(0),
          description: dto.description,
          performedById: currentUser.sub,
          destinationAccountId: updatedAccount.id,
        },
        include: {
          sourceAccount: {
            select: {
              accountNumber: true,
            },
          },
          destinationAccount: {
            select: {
              accountNumber: true,
            },
          },
        },
      });

      return createdTransaction;
    });

    return this.toTransactionResponse(result);
  }

  async withdraw(currentUser: AuthenticatedUser, dto: WithdrawDto) {
    // Withdraw hanya boleh dilakukan dari account yang dimiliki/diizinkan untuk user.
    const account = await this.accountsService.findAccessibleAccountOrThrow(
      dto.accountId,
      currentUser,
    );
    const amount = new Prisma.Decimal(dto.amount);

    // Saldo account dicek sebelum transaksi dimulai agar tidak menjadi minus.
    if (account.balance.lt(amount)) {
      throw new BadRequestException('Insufficient balance for this withdrawal.');
    }

    const result = await this.prisma.$transaction(async (transactionClient) => {
      const updatedAccount = await transactionClient.account.update({
        where: { id: account.id },
        data: {
          balance: account.balance.minus(amount),
        },
      });

      const createdTransaction = await transactionClient.transaction.create({
        data: {
          reference: this.generateReference(),
          transactionType: TransactionType.WITHDRAW,
          status: TransactionStatus.COMPLETED,
          amount,
          // Withdraw juga tidak dikenakan biaya admin pada aturan ini.
          adminFee: new Prisma.Decimal(0),
          description: dto.description,
          performedById: currentUser.sub,
          sourceAccountId: updatedAccount.id,
        },
        include: {
          sourceAccount: {
            select: {
              accountNumber: true,
            },
          },
          destinationAccount: {
            select: {
              accountNumber: true,
            },
          },
        },
      });

      return createdTransaction;
    });

    return this.toTransactionResponse(result);
  }

  async transfer(currentUser: AuthenticatedUser, dto: TransferDto) {
    // Transfer ke account yang sama tidak masuk akal, jadi langsung ditolak.
    if (dto.sourceAccountId === dto.destinationAccountId) {
      throw new BadRequestException(
        'Source account and destination account must be different.',
      );
    }

    const sourceAccount = await this.accountsService.findAccessibleAccountOrThrow(
      dto.sourceAccountId,
      currentUser,
    );
    // Account tujuan cukup dicek keberadaannya langsung dari database.
    const destinationAccount = await this.prisma.account.findUnique({
      where: { id: dto.destinationAccountId },
    });

    if (!destinationAccount) {
      throw new NotFoundException('Destination account was not found.');
    }

    // Sederhananya, sistem ini belum mendukung konversi kurs antar mata uang.
    if (sourceAccount.currency !== destinationAccount.currency) {
      throw new BadRequestException(
        'Transfer between different currencies is not supported.',
      );
    }

    const amount = new Prisma.Decimal(dto.amount);
    const adminFee = TransactionsService.TRANSFER_ADMIN_FEE;
    // Total saldo yang dipotong dari pengirim = nominal transfer + biaya admin.
    const totalDebited = amount.plus(adminFee);

    // Transfer wajib gagal bila saldo sumber tidak cukup untuk nominal + biaya admin.
    if (sourceAccount.balance.lt(totalDebited)) {
      throw new BadRequestException(
        'Insufficient balance for this transfer and admin fee.',
      );
    }

    const result = await this.prisma.$transaction(async (transactionClient) => {
      await transactionClient.account.update({
        where: { id: sourceAccount.id },
        data: {
          // Pengirim dipotong total nominal transfer beserta biaya admin.
          balance: sourceAccount.balance.minus(totalDebited),
        },
      });

      await transactionClient.account.update({
        where: { id: destinationAccount.id },
        data: {
          // Penerima hanya menerima nominal transfer tanpa admin fee.
          balance: destinationAccount.balance.plus(amount),
        },
      });

      const createdTransaction = await transactionClient.transaction.create({
        data: {
          reference: this.generateReference(),
          transactionType: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          amount,
          adminFee,
          description: dto.description,
          performedById: currentUser.sub,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destinationAccount.id,
        },
        include: {
          sourceAccount: {
            select: {
              accountNumber: true,
            },
          },
          destinationAccount: {
            select: {
              accountNumber: true,
            },
          },
        },
      });

      return createdTransaction;
    });

    return this.toTransactionResponse(result);
  }

  async findAll(currentUser: AuthenticatedUser) {
    // Histori transaksi difilter berdasarkan account sumber/tujuan yang dimiliki user.
    const transactions = await this.prisma.transaction.findMany({
      where: this.buildTransactionVisibilityWhere(currentUser),
      include: {
        sourceAccount: {
          select: {
            accountNumber: true,
          },
        },
        destinationAccount: {
          select: {
            accountNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions.map((transaction) => this.toTransactionResponse(transaction));
  }

  async findOne(id: number, currentUser: AuthenticatedUser) {
    // Detail transaksi hanya boleh diakses bila transaksi itu terkait account user.
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        ...this.buildTransactionVisibilityWhere(currentUser),
      },
      include: {
        sourceAccount: {
          select: {
            accountNumber: true,
          },
        },
        destinationAccount: {
          select: {
            accountNumber: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction was not found.');
    }

    return this.toTransactionResponse(transaction);
  }

  private buildTransactionVisibilityWhere(currentUser: AuthenticatedUser) {
    // Admin diberi akses penuh ke histori transaksi.
    if (currentUser.role === UserRole.ADMIN) {
      return {};
    }

    return {
      OR: [
        {
          sourceAccount: {
            userId: currentUser.sub,
          },
        },
        {
          destinationAccount: {
            userId: currentUser.sub,
          },
        },
      ],
    };
  }

  private generateReference() {
    // Reference dipakai sebagai identitas transaksi yang mudah dibaca dan cukup unik.
    const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TXN-${Date.now()}-${randomSuffix}`;
  }

  private toTransactionResponse(transaction: {
    id: number;
    reference: string;
    transactionType: TransactionType;
    status: TransactionStatus;
    amount: { toNumber(): number };
    adminFee: { toNumber(): number };
    description: string | null;
    performedById: number;
    sourceAccountId: number | null;
    destinationAccountId: number | null;
    createdAt: Date;
    updatedAt: Date;
    sourceAccount?: { accountNumber: string } | null;
    destinationAccount?: { accountNumber: string } | null;
  }): TransactionResponseDto {
    // Helper ini menyamakan format semua response transaksi.
    return {
      id: transaction.id,
      reference: transaction.reference,
      transactionType: transaction.transactionType,
      status: transaction.status,
      amount: transaction.amount.toNumber(),
      adminFee: transaction.adminFee.toNumber(),
      description: transaction.description,
      performedById: transaction.performedById,
      sourceAccountId: transaction.sourceAccountId,
      destinationAccountId: transaction.destinationAccountId,
      sourceAccountNumber: transaction.sourceAccount?.accountNumber ?? null,
      destinationAccountNumber:
        transaction.destinationAccount?.accountNumber ?? null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
