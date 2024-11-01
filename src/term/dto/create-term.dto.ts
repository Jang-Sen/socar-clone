import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  agreeOfTerm: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  agreeFourteen: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  agreeOfService: boolean;

  @IsBoolean()
  @ApiProperty({ example: false })
  agreeOfEvent?: boolean;
}
