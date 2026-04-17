import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

// UsersController menyediakan endpoint profile milik user yang sedang login.
@ApiTags('User')
@ApiBearerAuth('jwt-auth')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  getProfile(@CurrentUser() currentUser: AuthenticatedUser) {
    // Decorator @CurrentUser mengambil request.user yang disiapkan oleh JwtStrategy.
    return this.usersService.getProfile(currentUser);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    // Body update profile divalidasi lewat UpdateProfileDto.
    return this.usersService.updateProfile(currentUser, dto);
  }
}
