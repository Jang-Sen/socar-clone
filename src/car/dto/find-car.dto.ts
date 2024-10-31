import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scale } from '../entities/scale.enum';
import { Fuel } from '../entities/fuel.enum';

export class FindCarDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 분류', example: '중형' })
  scale: Scale;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 연료', example: '하이브리드' })
  fuel: Fuel;
}
