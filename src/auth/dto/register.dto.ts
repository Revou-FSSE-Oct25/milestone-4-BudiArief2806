import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

// DTO ini mendefinisikan bentuk body saat user melakukan registrasi.
export class RegisterDto {
  // fullName wajib berupa string dengan panjang minimal 3 karakter.
  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap user yang akan ditampilkan pada profile.',
  })
  @IsString()
  @MinLength(3)
  fullName: string;

  // callme adalah nama panggilan user yang sifatnya opsional.
  @ApiProperty({
    example: 'Sanu',
    required: false,
    description: 'Nama panggilan user yang akan ikut tampil pada profile.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  callme?: string;

  // email dipakai sebagai identitas unik untuk login.
  @ApiProperty({
    example: 'budi@example.com',
    description: 'Email unik yang akan dijadikan identitas login.',
  })
  @IsEmail()
  email: string;

  // password datang dalam bentuk plain text dan akan di-hash di service.
  @ApiProperty({
    example: 'SecurePass123',
    description: 'Password minimal 8 karakter yang akan di-hash sebelum disimpan.',
  })
  @IsString()
  @MinLength(8)
  password: string;

  // phone bersifat opsional untuk melengkapi profile.
  @ApiProperty({
    example: '+628123456789',
    required: false,
    description: 'Nomor telepon bersifat opsional untuk melengkapi profile user.',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
