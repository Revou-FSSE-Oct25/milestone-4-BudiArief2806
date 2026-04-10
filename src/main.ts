import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
