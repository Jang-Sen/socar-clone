import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Scale } from '../entities/scale.enum';
import { Fuel } from '../entities/fuel.enum';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @ApiProperty({ description: '차량명', example: 'K5' })
  carName: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '등급' })
  grade?: string;

  @IsEnum(Scale)
  @IsOptional()
  @ApiPropertyOptional({
    description: '자동차 분류',
    enum: Scale,
    default: Scale.DEFAULT,
  })
  scale?: Scale;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ description: '연식' })
  carYear?: number;

  @IsString()
  @ApiProperty({ description: '차량번호' })
  carNo: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '가격', example: 23000 })
  price: number;

  @IsString()
  @ApiProperty({ description: '변속기' })
  transmission: string;

  @IsNumber()
  @ApiProperty({ description: '주행거리' })
  mileage: number;

  @IsNumber()
  @ApiProperty({ description: '배기량' })
  displacement: number;

  @IsEnum(Fuel)
  @IsOptional()
  @ApiPropertyOptional({
    description: '자동차 연료',
    enum: Fuel,
    default: Fuel.DEFAULT,
  })
  fuel?: Fuel;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    description: '자동차 이미지',
  })
  carImgs?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '추가 사항' })
  memo?: string;
}
