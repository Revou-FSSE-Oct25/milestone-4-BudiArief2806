import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// AuthController menangani endpoint publik untuk register dan login.
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: UserProfileDto })
  @ApiBadRequestResponse({ description: 'Email already exists or request body is invalid.' })
  register(@Body() dto: RegisterDto) {
    // Register hanya membuat user baru dan mengembalikan profile-nya.
    // Token akan diberikan ketika user melakukan login.
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() dto: LoginDto) {
    // Validasi field login sudah ditangani DTO dan ValidationPipe global.
    return this.authService.login(dto);
  }
}
