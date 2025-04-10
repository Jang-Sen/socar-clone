import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@root/profile/entities/gender.enum';

export class CreateProfileDto {
  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({ description: '핸드폰 번호', example: '01095110662' })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '주소', example: '서울시 노원구' })
  address?: string;

  @IsDateString()
  @ApiProperty({
    description: '생년월일',
    example: '1998-05-08',
  })
  birth: string;

  @IsEnum(Gender)
  @ApiProperty({
    description: '성별',
    enum: Gender,
    default: Gender.DEFAULT,
  })
  gender: Gender;
}
