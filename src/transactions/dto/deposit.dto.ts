import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    example: 1,
    description: 'ID account tujuan deposit.',
  })
  @IsInt()
  accountId: number;

  @ApiProperty({
    example: 150000,
    description: 'Nominal deposit. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Top up saldo awal',
    description: 'Catatan transaksi yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
