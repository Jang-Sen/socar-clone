import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @ApiProperty({ example: '이용 잘 했습니다.' })
  contents: string;
}
