import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // url api 추가
  app.use(cookieParser()); // cookie 사용

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('socar-clone API')
    .setDescription('쏘카 클론 API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth()
    .addTag('socar')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Validator
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Response Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(8000);
}

bootstrap();
