import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @IsString()
  @ApiProperty({ description: '비밀번호 변경 토큰' })
  token: string;

  @IsString()
  @MinLength(7)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/) //최소 8 자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자
  @ApiProperty({ description: '새 비밀번호', example: '123456a!!' })
  password: string;
}
