import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email yang dipakai user saat registrasi.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'Password plain text yang akan dicocokkan dengan hash di database.',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
