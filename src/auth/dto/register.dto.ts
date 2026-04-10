import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap user yang akan ditampilkan pada profile.',
  })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    example: 'budi@example.com',
    description: 'Email unik yang akan dijadikan identitas login.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'Password minimal 8 karakter yang akan di-hash sebelum disimpan.',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '+628123456789',
    required: false,
    description: 'Nomor telepon bersifat opsional untuk melengkapi profile user.',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
