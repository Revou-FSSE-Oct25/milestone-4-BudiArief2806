import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Budi Santoso Updated',
    description: 'Nama lengkap baru user.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string;

  @ApiPropertyOptional({
    example: '+628123456780',
    description: 'Nomor telepon baru user.',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
