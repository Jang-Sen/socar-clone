import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from '@accommodation/entities/type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccommodationDto {
  @IsString()
  @ApiProperty({ description: '숙소 이름', example: '양양 모닝비치펜션' })
  name: string;

  @IsString()
  @ApiProperty({ description: '지역', example: '강원 양양군' })
  area: string;

  @IsEnum(Type)
  @ApiProperty({ description: '종류', example: Type.PENSION })
  type: Type;

  @IsDate()
  @ApiProperty({ description: '예약 날짜' })
  reservatedAt: Date;

  @IsNumber()
  @ApiProperty({ description: '가격', example: 75000 })
  price: number;

  @IsNumber()
  @ApiProperty({ description: '인원', example: 2 })
  personnel: number;

  @IsString()
  @ApiProperty({
    description: '숙소 정보',
    example:
      '해수욕장인근, 바다전망, 주차가능, 와이파이, 커피숍, 상비약, 스파/월풀/욕조',
  })
  information: string;
}
