import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sort } from '@common/constant/sort.constant';
import { Type } from 'class-transformer';

export class PageOptionsDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: '두글자 이상 입력해주세요.' })
  @ApiPropertyOptional({ description: '검색어 (이름)' })
  readonly keyword: string;

  @IsEnum(Sort)
  @IsOptional()
  @ApiPropertyOptional({
    description: '정렬 기준 (기본: 최근 등록순)',
    enum: Sort,
    default: Sort.LAST_CREATED,
  })
  readonly sort?: Sort = Sort.LAST_CREATED;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: '현재 페이지',
    default: 1,
  })
  readonly page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: '페이지에서 보여지는 데이터 수',
    default: 10,
  })
  readonly take: number = 10;

  get skip() {
    return (this.page - 1) * this.take;
  }
}
