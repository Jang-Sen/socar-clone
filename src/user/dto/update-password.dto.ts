import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @IsString()
  @ApiProperty({ description: '비밀번호 변경 토큰' })
  token: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자리를 입력해야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
    message:
      '비밀번호는 최소 8자리, 최소 하나의 문자, 하나의 숫자 및 특수문자가 포함되어야 합니다.',
  })
  @ApiProperty({ description: '새 비밀번호', example: '123456a!!' })
  password: string;
}
