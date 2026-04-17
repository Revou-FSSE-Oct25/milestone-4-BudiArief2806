import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../constants/metadata.constants';

// Menempelkan daftar role yang diizinkan ke sebuah route.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
