import { Module } from '@nestjs/common';
import { ReserveService } from './reserve.service';
import { ReserveController } from './reserve.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserve } from '@root/reserve/entities/reserve.entity';
import { CarModule } from '@car/car.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserve]), CarModule],
  controllers: [ReserveController],
  providers: [ReserveService],
})
export class ReserveModule {}
