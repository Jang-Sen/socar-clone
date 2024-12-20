import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
