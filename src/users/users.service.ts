import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User profile was not found.');
    }

    return this.toUserProfile(user);
  }

  async updateProfile(currentUser: AuthenticatedUser, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User profile was not found.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.sub },
      data: {
        fullName: dto.fullName ?? user.fullName,
        phone: dto.phone ?? user.phone,
      },
    });

    return this.toUserProfile(updatedUser);
  }

  private toUserProfile(user: {
    id: number;
    email: string;
    fullName: string;
    phone: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
