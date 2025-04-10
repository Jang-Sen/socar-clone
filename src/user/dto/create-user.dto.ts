import {
  IsArray,
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
import { Term } from '@term/entities/term.entity';
import { Profile } from '@root/profile/entities/profile.entity';
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
  @ApiPropertyOptional({
    description: '유저 프로필',
    type: CreateProfileDto,
  })
  profile?: Profile;

  @IsEnum(Provider)
  @IsOptional()
  @ApiPropertyOptional({
    description: '제공',
    enum: Provider,
    example: Provider.LOCAL,
  })
  provider?: Provider;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
  })
  @ApiPropertyOptional({
    type: [String],
    description: '프로필 이미지',
    default: null,
  })
  profileImg?: string[];

  @IsOptional()
  @ApiPropertyOptional({ description: '이용약관', type: CreateTermDto })
  term?: Term;
}
