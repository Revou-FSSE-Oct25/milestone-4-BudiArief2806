import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'budi@example.com' })
  email: string;

  @ApiProperty({ example: 'Budi Santoso' })
  fullName: string;

  @ApiProperty({ example: '+628123456789', nullable: true })
  phone: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
