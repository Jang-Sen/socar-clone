import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';
import { Provider } from '../entities/provider.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: '유저 이메일', example: 'dh789521@gmail.com' })
  email: string;

  @IsString()
  @MinLength(7)
  @ApiProperty({ description: '비밀번호', example: '123456a!' })
  password?: string;

  @IsString()
  @MinLength(2)
  @ApiProperty({ description: '이름', example: '오장원' })
  username: string;

  @IsNumber()
  @ApiProperty({ description: '핸드폰 번호', example: '01095110662' })
  phone?: number;

  @IsString()
  @ApiProperty({ description: '주소', example: '서울시 노원구' })
  address?: string;

  @IsString()
  provider?: Provider;

  @IsString()
  profileImg?: string;
}
