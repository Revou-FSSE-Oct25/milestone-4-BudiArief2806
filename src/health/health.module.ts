import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

// Module kecil khusus endpoint healthcheck.
// Endpoint ini dipakai Railway untuk memastikan aplikasi hidup normal.
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
