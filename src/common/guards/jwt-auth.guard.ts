import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants';

// Guard ini memastikan route private hanya bisa diakses dengan JWT valid.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // Guard global akan melewatkan route yang ditandai @Public().
  override canActivate(context: ExecutionContext) {
    // Reflector membaca metadata yang sebelumnya ditempel lewat decorator @Public().
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // Error default Passport diganti supaya response unauthorized lebih jelas.
  override handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    // Bila Passport gagal menemukan user valid, request akan langsung ditolak 401.
    if (err || !user) {
      throw new UnauthorizedException('Authentication token is missing or invalid.');
    }

    return user;
  }
}
