import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';

// UsersService menangani pengambilan dan perubahan profile user yang sedang login.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(currentUser: AuthenticatedUser) {
    // currentUser berasal dari JWT payload yang sudah lolos guard.
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User profile was not found.');
    }

    return this.toUserProfile(user);
  }

  async updateProfile(currentUser: AuthenticatedUser, dto: UpdateProfileDto) {
    // Ambil data lama agar field yang tidak diubah tetap dipertahankan.
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User profile was not found.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.sub },
      data: {
        // Operator ?? dipakai agar nilai lama tetap dipakai bila field tidak dikirim.
        fullName: dto.fullName ?? user.fullName,
        // callme ikut bisa diperbarui seperti fullName dan phone.
        callme: dto.callme ?? user.callme,
        phone: dto.phone ?? user.phone,
      },
    });

    return this.toUserProfile(updatedUser);
  }

  private toUserProfile(user: {
    id: number;
    email: string;
    fullName: string;
    callme: string | null;
    phone: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfileDto {
    // Helper ini mengubah data entity Prisma menjadi DTO response profile.
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
