import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';

// DTO pembuatan rekening baru.
export class CreateAccountDto {
  // Nama rekening tampil di UI untuk membedakan rekening user.
  @ApiProperty({
    example: 'Budi Main Wallet',
    description: 'Nama tampilan account untuk memudahkan user membedakan rekening.',
  })
  @IsString()
  @MinLength(3)
  accountName: string;

  // Jenis rekening dibatasi oleh enum dari Prisma.
  @ApiProperty({
    enum: AccountType,
    example: AccountType.SAVINGS,
    description: 'Jenis account yang akan dibuat.',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  // Currency opsional, tetapi bila dikirim harus tepat 3 karakter.
  @ApiPropertyOptional({
    example: 'IDR',
    description: 'Kode mata uang account. Default-nya IDR.',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
