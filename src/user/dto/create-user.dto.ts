import {
  IsEmail,
  IsEnum,
  IsNumber,
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
  @MinLength(2)
  @ApiProperty({ description: '이름', example: '오장원' })
  username: string;

  @IsNumber()
  @ApiProperty({ description: '핸드폰 번호', example: 1095110662 })
  phone?: number;

  @IsString()
  @ApiProperty({ description: '주소', example: '서울시 노원구' })
  address?: string;

  @IsEnum(Provider)
  @ApiProperty({ description: '제공', example: Provider.LOCAL })
  provider?: Provider;

  @IsString()
  @IsOptional()
  profileImg?: string;

  @ApiProperty({ description: '이용약관', example: CreateTermDto })
  term?: Term;
}
