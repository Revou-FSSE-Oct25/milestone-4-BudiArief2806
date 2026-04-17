import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// DTO untuk payload penarikan saldo.
export class WithdrawDto {
  // Account sumber dana yang akan dikurangi saldonya.
  @ApiProperty({
    example: 1,
    description: 'ID account sumber penarikan.',
  })
  @IsInt()
  accountId: number;

  // Nominal wajib positif sebelum dicek kecukupan saldonya di service.
  @ApiProperty({
    example: 50000,
    description: 'Nominal penarikan. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  // Catatan opsional untuk menjelaskan konteks penarikan.
  @ApiPropertyOptional({
    example: 'Tarik tunai ATM',
    description: 'Catatan transaksi yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
