import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// AuthService berisi business logic untuk registrasi dan login user.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Cek lebih dulu apakah email sudah dipakai user lain.
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    // Password selalu di-hash agar database tidak pernah menyimpan password asli.
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        // Data register disimpan ke tabel User.
        fullName: dto.fullName,
        // Nama field harus konsisten mengikuti schema Prisma, yaitu callme.
        callme: dto.callme,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
      },
    });

    // Register sekarang hanya mengembalikan profile user baru.
    // Token akses sengaja baru diberikan saat proses login.
    return this.toUserProfile(user);
  }

  async login(dto: LoginDto) {
    // Cari user berdasarkan email yang dikirim saat login.
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Password plain text dibandingkan dengan hash yang tersimpan di database.
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: {
    id: number;
    email: string;
    fullName: string;
    // callme nullable karena field ini optional di database.
    callme: string | null;
    phone: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }) {
    // Payload token hanya dibuat untuk endpoint login.
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Response auth mengirim token plus ringkasan profile user.
    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.toUserProfile(user),
    };
  }

  private toUserProfile(user: {
    id: number;
    email: string;
    fullName: string;
    // Profile response juga harus siap menerima null.
    callme: string | null;
    phone: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfileDto {
    // Helper ini dipakai supaya bentuk response profile konsisten di seluruh auth/user module.
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      callme: user.callme,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
