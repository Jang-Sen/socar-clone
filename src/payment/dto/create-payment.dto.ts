import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '카드사 이름', example: '신한은행' })
  cardCompany: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '카드번호', example: '**** **** **** 1234' })
  cardNumber: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '카드 CVC 번호', example: 123 })
  cardCvc: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '카드 유효기간 (MM/YY)', example: '12/27' })
  cardExpire: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '카드 별명', example: '메인 카드' })
  cardAlias?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({ description: '대표 카드 여부', example: true })
  isMain: boolean;
}
