import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 이름', example: 'K5' })
  carName: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 렌트 가격', example: 23000 })
  price: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 분류', example: '중형' })
  scale: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자동차 연료', example: '하이브리드' })
  fuel: string;

  carImg?: string;
}
