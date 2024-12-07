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
import { ApiProperty } from '@nestjs/swagger';
import { Term } from '../../term/entities/term.entity';
import { CreateTermDto } from '../../term/dto/create-term.dto';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: '유저 이메일', example: 'dh789521@gmail.com' })
  email: string;

  @IsString()
  @MinLength(7)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/) //최소 8 자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자
  @ApiProperty({ description: '비밀번호', example: '123456a!' })
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiProperty({ description: '이름', example: '오장원' })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '핸드폰 번호', example: '01095110662' })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '주소', example: '서울시 노원구' })
  address?: string;

  @IsEnum(Provider)
  @IsOptional()
  @ApiProperty({ description: '제공', example: Provider.LOCAL })
  provider?: Provider;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  profileImg?: string[];

  @ApiProperty({ description: '이용약관', type: CreateTermDto })
  term?: Term;
}
