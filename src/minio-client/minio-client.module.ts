import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';

@Module({
  imports: [
    ConfigModule,
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT'),
        port: configService.get('MINIO_PORT'),
        accessKey: configService.get('MINIO_ROOT_USER'),
        secretKey: configService.get('MINIO_ROOT_PASSWORD'),
        useSSL: false,
      }),
    }),
  ],
  providers: [MinioClientService],
})
export class MinioClientModule {}
