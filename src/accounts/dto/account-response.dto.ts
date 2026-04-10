import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class AccountResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '102345678901' })
  accountNumber: string;

  @ApiProperty({ example: 'Budi Main Wallet' })
  accountName: string;

  @ApiProperty({ enum: AccountType, example: AccountType.SAVINGS })
  accountType: AccountType;

  @ApiProperty({ example: 'IDR' })
  currency: string;

  @ApiProperty({ example: 250000 })
  balance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
