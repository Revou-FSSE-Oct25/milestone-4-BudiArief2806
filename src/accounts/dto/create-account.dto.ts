import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Budi Main Wallet',
    description: 'Nama tampilan account untuk memudahkan user membedakan rekening.',
  })
  @IsString()
  @MinLength(3)
  accountName: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.SAVINGS,
    description: 'Jenis account yang akan dibuat.',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional({
    example: 'IDR',
    description: 'Kode mata uang account. Default-nya IDR.',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
