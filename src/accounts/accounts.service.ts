import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountType, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

// AccountsService berisi business logic CRUD rekening/account.
@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(currentUser: AuthenticatedUser, dto: CreateAccountDto) {
    // Account baru otomatis dimiliki oleh user yang sedang login.
    const account = await this.prisma.account.create({
      data: {
        userId: currentUser.sub,
        accountNumber: await this.generateUniqueAccountNumber(),
        accountName: dto.accountName,
        accountType: dto.accountType,
        currency: (dto.currency ?? 'IDR').toUpperCase(),
      },
    });

    return this.toAccountResponse(account);
  }

  async findAll(currentUser: AuthenticatedUser) {
    // User biasa hanya melihat rekening miliknya, admin bisa melihat semuanya.
    const accounts = await this.prisma.account.findMany({
      where: this.buildAccountVisibilityWhere(currentUser),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return accounts.map((account) => this.toAccountResponse(account));
  }

  async findOne(id: number, currentUser: AuthenticatedUser) {
    const account = await this.findAccessibleAccountOrThrow(id, currentUser);
    return this.toAccountResponse(account);
  }

  async update(id: number, currentUser: AuthenticatedUser, dto: UpdateAccountDto) {
    // Pastikan user memang berhak mengakses account yang akan diubah.
    const existingAccount = await this.findAccessibleAccountOrThrow(id, currentUser);

    const account = await this.prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        accountName: dto.accountName ?? existingAccount.accountName,
        accountType: dto.accountType ?? existingAccount.accountType,
        currency: dto.currency
          ? dto.currency.toUpperCase()
          : existingAccount.currency,
      },
    });

    return this.toAccountResponse(account);
  }

  async remove(id: number, currentUser: AuthenticatedUser) {
    // Penghapusan account dibatasi oleh aturan bisnis tertentu.
    const account = await this.findAccessibleAccountOrThrow(id, currentUser);

    if (account.balance.toNumber() > 0) {
      throw new BadRequestException(
        'Account cannot be deleted while it still has a positive balance.',
      );
    }

    // Account yang sudah punya histori transaksi tidak boleh dihapus agar audit trail aman.
    const transactionCount = await this.prisma.transaction.count({
      where: {
        OR: [{ sourceAccountId: account.id }, { destinationAccountId: account.id }],
      },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        'Account cannot be deleted because it already has transaction history.',
      );
    }

    await this.prisma.account.delete({
      where: { id: account.id },
    });

    return {
      message: 'Account deleted successfully.',
    };
  }

  async findAccessibleAccountOrThrow(id: number, currentUser: AuthenticatedUser) {
    // Query awal hanya mencari apakah account dengan ID tersebut ada.
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account was not found.');
    }

    // Admin diberi akses penuh, user biasa dibatasi ke account miliknya.
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isAdmin && account.userId !== currentUser.sub) {
      throw new ForbiddenException('You are not allowed to access this account.');
    }

    return account;
  }

  private buildAccountVisibilityWhere(currentUser: AuthenticatedUser) {
    // Fungsi ini dipakai ulang untuk menyusun filter query list account.
    if (currentUser.role === UserRole.ADMIN) {
      return {};
    }

    return {
      userId: currentUser.sub,
    };
  }

  private async generateUniqueAccountNumber() {
    // Account number dibuat otomatis agar format konsisten dan risiko bentrok kecil.
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const accountNumber = `10${Math.floor(
        1000000000 + Math.random() * 9000000000,
      )}`;

      const existingAccount = await this.prisma.account.findUnique({
        where: { accountNumber },
      });

      if (!existingAccount) {
        return accountNumber;
      }
    }

    throw new BadRequestException(
      'Failed to generate a unique account number. Please try again.',
    );
  }

  private toAccountResponse(account: {
    id: number;
    userId: number;
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    currency: string;
    balance: { toNumber(): number };
    createdAt: Date;
    updatedAt: Date;
  }): AccountResponseDto {
    // Decimal Prisma diubah ke number biasa agar response JSON mudah dibaca client.
    return {
      id: account.id,
      userId: account.userId,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance.toNumber(),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
