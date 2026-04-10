import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    example: 1,
    description: 'ID account sumber transfer.',
  })
  @IsInt()
  sourceAccountId: number;

  @ApiProperty({
    example: 2,
    description: 'ID account tujuan transfer.',
  })
  @IsInt()
  destinationAccountId: number;

  @ApiProperty({
    example: 125000,
    description: 'Nominal transfer. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Bayar kebutuhan bulanan',
    description: 'Catatan transfer yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
