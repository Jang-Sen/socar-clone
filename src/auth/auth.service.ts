import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TokenPayloadInterface } from './interface/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { UserService } from '@user/user.service';
import { MailService } from '@mail/mail.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { Provider } from '@user/entities/provider.enum';
import { LoginUserDto } from '@user/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
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

  // Token 발행 로직
  public getToken(
    tokenType: 'access' | 'refresh',
    userId: string,
  ): {
    token: string;
    cookie: string;
  } {
    const payload: TokenPayloadInterface = { userId };

    const secret = this.configService.get(
      tokenType === 'access' ? 'ACCESS_TOKEN_SECRET' : 'REFRESH_TOKEN_SECRET',
    );

    const expiresIn = this.configService.get(
      tokenType === 'access' ? 'ACCESS_TOKEN_TIME' : 'REFRESH_TOKEN_TIME',
    );

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    const cookieName = tokenType === 'access' ? 'Authentication' : 'Refresh';
    const cookie = `${cookieName}=${token}; PATH=/; Max-Age=${expiresIn}`;

    console.log(cookie);

    return { token, cookie };
  }

  // Access Token 발급 로직
  // public getAccessToken(userId: string): {
  //   token: string;
  //   cookie: string;
  // } {
  //   const payload: TokenPayloadInterface = { userId };
  //
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('ACCESS_TOKEN_SECRET'),
  //     expiresIn: this.configService.get('ACCESS_TOKEN_TIME'),
  //   });
  //
  //   const cookie = `Authentication=${token}; PATH=/; Max-Age=${this.configService.get('ACCESS_TOKEN_TIME')}`;
  //
  //   return { token, cookie };
  // }
  //
  // // Refresh Token 발급 로직
  // public getRefreshToken(userId: string): {
  //   token: string;
  //   cookie: string;
  // } {
  //   const payload: TokenPayloadInterface = { userId };
  //
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('REFRESH_TOKEN_SECRET'),
  //     expiresIn: this.configService.get('REFRESH_TOKEN_TIME'),
  //   });
  //
  //   const cookie = `Refresh=${token}; PATH=/; Max-Age=${this.configService.get('REFRESH_TOKEN_TIME')}`;
  //
  //   return { token, cookie };
  // }

  // 비밀번호 찾기 위해 이메일 전송(비밀번호 토큰 전송) 로직
  async findPasswordSendEmail(email: string) {
    // 유저가 존재하는지 확인
    const user = await this.userService.findBy('email', email);

    // 소셜 로그인 사용자 이용불가
    if (user.provider !== Provider.LOCAL) {
      throw new HttpException(
        '소셜 로그인 유저는 이용하실 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 비밀번호 변경 토큰 전송
    const payload = { email };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('FIND_PASSWORD_TOKEN_SECRET'),
      expiresIn: this.configService.get('FIND_PASSWORD_TOKEN_TIME'),
    });

    // 이메일에 전송할 url 생성
    const url = `${this.configService.get('EMAIL_BASE_URL')}/reset-password?token=${token}`;

    // 이메일 전송
    await this.mailService.sendMail({
      to: email,
      subject: 'socar-clone 비밀번호 변경에 관한 메일입니다.',
      text: `비밀번호 변경 url: ${url}`,
    });
  }

  // 이메일 인증번호 로직
  async sendEmailOTP(email: string): Promise<string> {
    const otpNum = this.generateOTP();

    // cache 저장
    await this.cacheManager.set(email, otpNum);

    const result = await this.mailService.sendMail({
      to: email,
      subject: 'socar-clone 인증번호 발송 메일입니다.',
      text: `인증번호는 ${otpNum} 입니다.`,
    });

    if (result.accepted.length === 0) {
      throw new HttpException(
        '인증번호 전송에 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return '인증번호 전송 완료';
  }

  // 이메일 인증번호 체크 로직
  async checkEmailOTP(email: string, code: string): Promise<string> {
    // cache에 email로 저장된 OTP 번호 갖고오기
    const codeFromRedis = await this.cacheManager.get(email);

    // 작성한 OTP와 redis에 있는 번호가 일치한지 확인
    if (codeFromRedis !== code) {
      throw new HttpException(
        'OTP 번호가 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // redis에 저장된 데이터 지우기
    await this.cacheManager.del(email);

    return '인증번호 확인 완료';
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
