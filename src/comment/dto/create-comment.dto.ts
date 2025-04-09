import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @ApiProperty({ description: '리뷰', example: '이용 잘 했습니다.' })
  contents: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: '평점', example: 5 })
  rating: number;
}
