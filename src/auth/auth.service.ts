import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // 회원가입 로직
  async signup(dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  // 로그인 로직
  async login(dto: LoginUserDto) {
    const user = await this.userService.findBy('email', dto.email);
    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }
}
