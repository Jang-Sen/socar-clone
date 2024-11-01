import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // url api추가
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('socar-clone API')
    .setDescription('쏘카 클론 API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('socar')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(8000);
}

bootstrap();
