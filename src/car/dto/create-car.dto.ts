import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scale } from '../entities/scale.enum';
import { Fuel } from '../entities/fuel.enum';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 이름', example: 'K5' })
  carName: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 렌트 가격', example: 23000 })
  price: number;

  @ApiProperty({ description: '자동차 분류', example: '중형' })
  scale?: Scale;

  @ApiProperty({ description: '자동차 연료', example: '하이브리드' })
  fuel?: Fuel;

  @ApiProperty()
  carImg?: string;
}
