import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

// DTO untuk update profile dibuat opsional karena user boleh mengubah
// hanya field tertentu saja.
export class UpdateProfileDto {
  // Nama baru jika user ingin memperbarui nama lengkap.
  @ApiPropertyOptional({
    example: 'Budi Santoso Updated',
    description: 'Nama lengkap baru user.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string;

  // callme bisa diubah kapan saja bila user ingin mengganti nama panggilan.
  @ApiPropertyOptional({
    example: 'Sanu',
    description: 'Nama panggilan baru user.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  callme?: string;
  // Nomor telepon baru jika tersedia.
  @ApiPropertyOptional({
    example: '+628123456780',
    description: 'Nomor telepon baru user.',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
