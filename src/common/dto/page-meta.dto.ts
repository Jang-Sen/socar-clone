import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageParameterInterface } from '../interface/page-parameter.interface';

export class PageMetaDto {
  @ApiPropertyOptional({ description: '현재 페이지' })
  readonly page: number;

  @ApiPropertyOptional({ description: '페이지에서 보여지는 데이터 수' })
  readonly take: number;

  @ApiPropertyOptional({ description: '전체 데이터 수' })
  readonly itemCount: number;

  @ApiPropertyOptional({ description: '전체 페이지 수' })
  readonly pageCount: number;

  @ApiPropertyOptional({ description: '전 페이지가 있는지' })
  readonly hasBeforePage: boolean;

  @ApiPropertyOptional({ description: '다음 페이지가 있는지' })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageParameterInterface) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasBeforePage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
