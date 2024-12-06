import { Module } from '@nestjs/common';
import { AccommodationController } from '@accommodation/accommodation.controller';
import { AccommodationService } from '@accommodation/accommodation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accommodation } from '@accommodation/entities/accommodation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accommodation])],
  controllers: [AccommodationController],
  providers: [AccommodationService],
})
export class AccommodationModule {}