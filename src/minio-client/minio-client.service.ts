import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket: string;

  private get client() {
    return this.minioService.client;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}
}
