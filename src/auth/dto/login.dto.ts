import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO ini memvalidasi payload login sebelum diteruskan ke service.
export class LoginDto {
  // Email harus valid dan sesuai data user yang tersimpan.
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email yang dipakai user saat registrasi.',
  })
  @IsEmail()
  email: string;

  // Password wajib minimal 8 karakter agar konsisten dengan aturan registrasi.
  @ApiProperty({
    example: 'SecurePass123',
    description: 'Password plain text yang akan dicocokkan dengan hash di database.',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
