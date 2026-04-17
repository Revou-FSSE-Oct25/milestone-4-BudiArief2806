import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

// JwtStrategy menjelaskan ke Passport cara mengambil dan memvalidasi token JWT.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Token dibaca dari header Authorization: Bearer <token>.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'development-only-secret',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    // Payload JWT diterjemahkan menjadi request.user agar controller/service
    // bisa langsung tahu siapa user yang sedang login.
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
