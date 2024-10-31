import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';
import { Provider } from '../entities/provider.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(7)
  password?: string;

  @IsString()
  @MinLength(2)
  username: string;

  @IsNumber()
  phone?: number;

  @IsString()
  address?: string;

  @IsString()
  provider?: Provider;

  @IsString()
  profileImg?: string;
}
