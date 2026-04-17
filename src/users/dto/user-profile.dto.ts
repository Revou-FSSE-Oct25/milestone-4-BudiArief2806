import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

// DTO ini menjelaskan bentuk data profile user yang dikembalikan API.
export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'budi@example.com' })
  email: string;

  @ApiProperty({ example: 'Budi Santoso' })
  fullName: string;

  // Karena callme bersifat opsional di database, response profile juga bisa bernilai null.
  @ApiProperty({ example: 'Sanu', nullable: true })
  callme: string | null;

  @ApiProperty({ example: '+628123456789', nullable: true })
  phone: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  // Timestamp membantu audit kapan user dibuat dan terakhir diperbarui.
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
