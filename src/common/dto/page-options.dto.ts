import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PageOptionsDto {
  @IsOptional()
  @ApiPropertyOptional({ description: '검색어(이름)' })
  readonly keyword: string;

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
