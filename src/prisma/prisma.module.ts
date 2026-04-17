import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// PrismaModule dibuat global supaya PrismaService bisa dipakai di semua module
// tanpa perlu di-import berulang kali pada setiap tempat penggunaan.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
