import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database.module';
import { UserModule } from '@user/user.module';
import { CarModule } from '@car/car.module';
import { AuthModule } from '@auth/auth.module';
import { RedisModule } from '@redis/redis.module';
import { MailModule } from '@mail/mail.module';
import { TermModule } from '@term/term.module';
import { AccommodationModule } from '@accommodation/accommodation.module';
import { AppController } from '@root/app.controller';
import { AppService } from '@root/app.service';
import { MinioClientModule } from './minio-client/minio-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_TTL: Joi.number().required(),
        MINIO_ENDPOINT: Joi.string().required(),
        MINIO_PORT: Joi.number().required(),
        MINIO_ROOT_USER: Joi.string().required(),
        MINIO_ROOT_PASSWORD: Joi.string().required(),
        MINIO_BUCKET: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_TIME: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_TIME: Joi.string().required(),
        FIND_PASSWORD_TOKEN_SECRET: Joi.string().required(),
        FIND_PASSWORD_TOKEN_TIME: Joi.string().required(),
        EMAIL_BASE_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CLIENT_SECRET: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UserModule,
    CarModule,
    AuthModule,
    RedisModule,
    MailModule,
    TermModule,
    AccommodationModule,
    MinioClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
