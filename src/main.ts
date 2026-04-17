import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestFactory membuat instance aplikasi utama berdasarkan AppModule.
  const app = await NestFactory.create(AppModule);
  // ConfigService dipakai untuk membaca PORT atau konfigurasi lain dari environment.
  const configService = app.get(ConfigService);

  // ValidationPipe global memastikan semua DTO divalidasi sebelum
  // business logic dijalankan. Ini penting untuk menjaga endpoint tetap aman.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger dipakai sebagai dokumentasi API yang bisa langsung diuji oleh reviewer.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Banking API')
    .setDescription(
      'REST API fundamental banking system built with NestJS, Prisma, JWT, and PostgreSQL.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan JWT token dengan format: Bearer <token>',
      },
      'jwt-auth',
    )
    .build();

  // Document Swagger digenerate dari seluruh decorator OpenAPI yang ada di controller/DTO.
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Endpoint /docs akan menampilkan halaman Swagger UI yang bisa diuji langsung.
  SwaggerModule.setup('docs', app, document);

  // PORT akan mengikuti environment deploy, dan fallback ke 3000 saat lokal.
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
