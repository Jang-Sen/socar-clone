import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTermDto {
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({ description: '개인정보 수집 및 이용 동의', example: true })
  agreeOfTerm: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({ description: '만 14세 이상', example: true })
  agreeFourteen: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({ description: '서비스 이용 약관', example: true })
  agreeOfService: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({ description: '마케팅 메일, SMS 수신 동의', example: false })
  agreeOfEvent?: boolean;
}
