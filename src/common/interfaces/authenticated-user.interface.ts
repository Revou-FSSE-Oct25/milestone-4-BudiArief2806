import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: UserRole;
}
