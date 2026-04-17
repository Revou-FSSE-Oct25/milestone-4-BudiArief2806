import { UserRole } from '@prisma/client';

// Bentuk payload user yang sudah divalidasi dari JWT.
// Object inilah yang nantinya tersedia di request.user.
export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: UserRole;
}
