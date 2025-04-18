import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { AppModule } from '@root/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.setGlobalPrefix('api'); // url api 추가
  app.use(cookieParser()); // cookie 사용
  app.enableCors(); // 허용된 ip 만 접속 가능하도록 설정

  // URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('와보카 API')
    .setDescription('와보카 API 입니다.')
    .setVersion('1.0')
    .addServer('http://localhost:81/api', 'Local')
    .addServer('https://jangsen.duckdns.org:442/api', 'Production')
    // .addServer('http://localhost:8100')
    // .addServer('http://jangsen.duckdns.org:8100')
    .addBearerAuth()
    .addCookieAuth()
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
