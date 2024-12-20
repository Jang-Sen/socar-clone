import { Module } from '@nestjs/common';
import { CommentController } from '@comment/comment.controller';
import { CommentService } from '@comment/comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@comment/entities/comment.entity';
import { CarModule } from '@car/car.module';
import { AccommodationModule } from '@accommodation/accommodation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CarModule,
    AccommodationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
