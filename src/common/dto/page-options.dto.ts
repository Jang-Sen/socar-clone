import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '@common/constant/order.constant';
import { Sort } from '@common/constant/sort.constant';
import { Type } from 'class-transformer';

export class PageOptionsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '검색어(이름)' })
  readonly keyword: string;

  @IsEnum(Order)
  @IsOptional()
  @ApiPropertyOptional({
    description: '차순(기본 내림차순)',
    enum: Order,
    default: Order.ASC,
  })
  readonly order?: Order = Order.DESC;

  @IsEnum(Sort)
  @IsOptional()
  @ApiPropertyOptional({
    description: '정렬 기준(기본 생성일자)',
    enum: Sort,
    default: Sort.CREATED_AT,
  })
  readonly sort?: Sort = Sort.CREATED_AT;

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
