import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '@common/constant/order.constant';
import { Sort } from '@common/constant/sort.constant';

export class PageOptionsDto {
  @IsOptional()
  @ApiPropertyOptional({ description: '검색어(이름)' })
  readonly keyword: string;

  @IsEnum(Order)
  @IsOptional()
  @ApiPropertyOptional({
    description: '정렬 순서',
    enum: Order,
    default: Order.ASC,
  })
  readonly order?: Order = Order.ASC;

  @IsEnum(Sort)
  @IsOptional()
  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: Sort,
    default: Sort.CREATED_AT,
  })
  readonly sort?: Sort = Sort.CREATED_AT;

  @IsOptional()
  @ApiPropertyOptional({ description: '현재 페이지', default: 1 })
  readonly page: number = 1;

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
