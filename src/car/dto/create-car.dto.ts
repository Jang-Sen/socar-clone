import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scale } from '../entities/scale.enum';
import { Fuel } from '../entities/fuel.enum';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @ApiProperty({ description: '자동차 이름', example: 'K5' })
  carName: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '자동차 렌트 가격', example: 23000 })
  price: number;

  @IsEnum(Scale)
  @IsOptional()
  @ApiProperty({ description: '자동차 분류', example: '중형' })
  scale?: Scale;

  @IsEnum(Fuel)
  @IsOptional()
  @ApiProperty({ description: '자동차 연료', example: '하이브리드' })
  fuel?: Fuel;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '자동차 이미지',
    example: ['car1.png', 'car1_2.jpg'],
  })
  carImgs?: string[];
}
