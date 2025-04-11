import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scale } from '../entities/scale.enum';
import { Fuel } from '../entities/fuel.enum';

export class FindCarDto {
  @IsString()
  @ApiProperty({ description: '차량 분류', example: '중형' })
  scale: Scale;

  @IsString()
  @ApiProperty({ description: '차량 연료', example: '하이브리드' })
  fuel: Fuel;
}
