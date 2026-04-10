import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    example: 1,
    description: 'ID account sumber penarikan.',
  })
  @IsInt()
  accountId: number;

  @ApiProperty({
    example: 50000,
    description: 'Nominal penarikan. Harus lebih besar dari 0.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Tarik tunai ATM',
    description: 'Catatan transaksi yang bersifat opsional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
