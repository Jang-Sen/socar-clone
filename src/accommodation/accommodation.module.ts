import { Module } from '@nestjs/common';
import { AccommodationController } from '@accommodation/accommodation.controller';
import { AccommodationService } from '@accommodation/accommodation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accommodation } from '@accommodation/entities/accommodation.entity';
import { MinioClientModule } from '@minio-client/minio-client.module';
import { RedisModule } from '@redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Accommodation]),
    MinioClientModule,
    RedisModule,
  ],
  controllers: [AccommodationController],
  providers: [AccommodationService],
  exports: [AccommodationService],
})
export class AccommodationModule {}
