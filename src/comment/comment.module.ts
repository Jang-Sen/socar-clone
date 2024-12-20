import { Module } from '@nestjs/common';
import { CommentController } from '@comment/comment.controller';
import { CommentService } from '@comment/comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@comment/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
