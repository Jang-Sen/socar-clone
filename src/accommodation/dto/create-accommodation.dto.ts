import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccommodationType } from '@accommodation/entities/accommodation-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAccommodationDto {
  @IsString()
  @ApiProperty({ description: '숙소 이름', example: '양양 모닝비치펜션' })
  name: string;

  @IsString()
  @ApiProperty({ description: '지역', example: '강원 양양군' })
  area: string;

  @IsEnum(AccommodationType)
  @ApiProperty({ description: '종류', example: AccommodationType.PENSION })
  accommodationType: AccommodationType;

  // @IsDate()
  // @Type(() => Date)
  // @ApiProperty({ description: '예약 날짜' })
  // reservatedAt?: Date;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '가격', example: 75000 })
  price: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '인원', example: 2 })
  personnel: number;

  @IsString()
  @ApiProperty({
    description: '숙소 정보',
    example:
      '해수욕장인근, 바다전망, 주차가능, 와이파이, 커피숍, 상비약, 스파/월풀/욕조',
  })
  information: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '숙소 이미지(10개 이하)',
  })
  accommodationImgs: string[];
}
