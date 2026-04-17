import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// DTO transfer menyimpan akun sumber, akun tujuan, dan nominal transfer.
export class TransferDto {
  // Rekening yang akan dikurangi saldonya.
  @ApiProperty({
    example: 1,
    description: 'ID account sumber transfer.',
  })
  @IsInt()
  sourceAccountId: number;

  // Rekening yang akan menerima saldo.
  @ApiProperty({
    example: 2,
    description: 'ID account tujuan transfer.',
  })
  @IsInt()
  destinationAccountId: number;

  // Nominal transfer wajib bernilai positif.
  @ApiProperty({
    example: 125000,
    description: 'Nominal transfer. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  // Catatan transfer bersifat opsional.
  @ApiPropertyOptional({
    example: 'Bayar kebutuhan bulanan',
    description: 'Catatan transfer yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
