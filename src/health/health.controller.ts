import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

// HealthController dipakai platform deploy untuk mengecek apakah service hidup.
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Simple health check endpoint for deployment monitoring' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-04-10T12:00:00.000Z',
      },
    },
  })
  getHealth() {
    // Endpoint ini sengaja dibuat sangat sederhana agar platform deploy
    // seperti Railway bisa mengecek apakah service benar-benar hidup.
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
