import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

// DTO response auth dipakai untuk menyamakan format hasil register dan login.
export class AuthResponseDto {
  // Token JWT yang nanti dikirim user pada header Authorization.
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYnVkaUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzQ0Mjc5MDAwLCJleHAiOjE3NDQyODI2MDB9.signature',
  })
  accessToken: string;

  // Menjelaskan skema token yang digunakan oleh API.
  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  // Profil user disertakan agar frontend bisa langsung menampilkan data dasar user.
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
