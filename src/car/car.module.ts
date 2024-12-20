import { Module } from '@nestjs/common';
import { MinioClientModule } from '@minio-client/minio-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarController } from '@car/car.controller';
import { CarService } from '@car/car.service';
import { Car } from '@car/entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car]), MinioClientModule],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}
