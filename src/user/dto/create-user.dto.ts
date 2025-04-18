import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Provider } from '../entities/provider.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTermDto } from '@term/dto/create-term.dto';
import { CreateProfileDto } from '@root/profile/dto/create-profile.dto';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: '유저 이메일', example: 'dh789521@gmail.com' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자리를 입력해야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
    message:
      '비밀번호는 최소 8자리, 최소 하나의 문자, 하나의 숫자 및 특수문자가 포함되어야 합니다.',
  })
  @ApiProperty({ description: '비밀번호', example: '123456a!' })
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: '이름은 최소 2글자를 입력하셔야 합니다.' })
  @ApiProperty({ description: '이름', example: '오장원' })
  username: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @ApiPropertyOptional({
    description: '유저 프로필',
    type: CreateProfileDto,
  })
  profile?: CreateProfileDto;

  @IsEnum(Provider)
  @IsOptional()
  @ApiPropertyOptional({
    description: '제공',
    enum: Provider,
    example: Provider.LOCAL,
  })
  provider?: Provider;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: '프로필 이미지(3개 까지 가능)',
    default: null,
  })
  profileImg?: any;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @ApiPropertyOptional({ description: '이용약관', type: CreateTermDto })
  term?: CreateTermDto;
}
