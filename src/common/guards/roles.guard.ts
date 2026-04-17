import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../constants/metadata.constants';

// RolesGuard membaca role yang dibutuhkan pada route tertentu.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Metadata role biasanya ditempel lewat decorator @Roles(...).
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // request.user diisi oleh JwtStrategy setelah token sukses diverifikasi.
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: UserRole } | undefined;

    return requiredRoles.includes(user?.role ?? UserRole.USER);
  }
}
