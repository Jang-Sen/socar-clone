import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { TokenPayloadInterface } from './interface/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '../user/entities/provider.enum';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  // 회원가입 로직
  async signup(dto: CreateUserDto) {
    return await this.userService.createUser({
      ...dto,
      provider: Provider.LOCAL,
    });
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

  // Access Token 발급 로직
  async getAccessToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_TIME'),
    });
  }

  // 이메일 인증번호 로직
  async sendEmailOTP(email: string) {
    const otpNum = this.generateOTP();

    // cache 저장
    await this.cache.set(email, otpNum);

    return await this.mailService.sendMail({
      to: email,
      subject: 'socar-clone 인증번호 발송 메일입니다.',
      text: `인증번호는 ${otpNum} 입니다.`,
    });
  }

  // 인증번호 생성 함수
  generateOTP() {
    let otp = '';

    for (let i = 1; i <= 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    return otp;
  }
}
