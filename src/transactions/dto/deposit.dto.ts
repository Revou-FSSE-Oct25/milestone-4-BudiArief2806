import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// DTO untuk payload deposit.
export class DepositDto {
  // Account tujuan penambahan saldo.
  @ApiProperty({
    example: 1,
    description: 'ID account tujuan deposit.',
  })
  @IsInt()
  accountId: number;

  // Nominal wajib positif agar tidak ada deposit negatif.
  @ApiProperty({
    example: 150000,
    description: 'Nominal deposit. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  // Catatan transaksi bersifat opsional.
  @ApiPropertyOptional({
    example: 'Top up saldo awal',
    description: 'Catatan transaksi yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
