import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '@auth/auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LocalGuard } from '@auth/guards/local.guard';
import { LoginUserDto } from '@user/dto/login-user.dto';
import { UserService } from '@user/user.service';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { EmailDto } from '@user/dto/email.dto';
import { UpdatePasswordDto } from '@user/dto/update-password.dto';
import { RefreshTokenGuard } from '@auth/guards/refresh-token.guard';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { GoogleGuard } from '@auth/guards/google.guard';
import { KakaoGuard } from '@auth/guards/kakao.guard';
import { NaverGuard } from '@auth/guards/naver.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EmailValidationDto } from '@user/dto/email-validation.dto';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // 회원가입 API
  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ description: '회원가입 DTO', type: CreateUserDto })
  async signup(@Body() dto: CreateUserDto) {
    return await this.authService.signup(dto);
  }

  // 로그인 API
  @Post('/login')
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ description: '로그인 DTO', type: LoginUserDto })
  async login(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;
    const { cookie: accessTokenCookie } = this.authService.getToken(
      'access',
      user.id,
    );
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    // Refresh Token -> Redis 에 담기
    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    // Token -> Cookie 에 담기
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user });
    // return { user, accessToken, refreshToken };
  }

  // 비밀번호 변경 이메일 보내기 API
  @Post('/find/password')
  @ApiOperation({ summary: '비밀번호 변경 이메일 보내기' })
  @ApiBody({ description: '이메일 DTO', type: EmailDto })
  async findPassword(@Body() dto: EmailDto) {
    return await this.authService.findPasswordSendEmail(dto.email);
  }

  // 비밀번호 변경 API
  @Post('/update/password')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBody({ description: '비밀번호 변경 DTO', type: UpdatePasswordDto })
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return await this.userService.updatePasswordWithToken(
      dto.token,
      dto.password,
    );
  }

  // Refresh Token을 이용해 Access Token 갱신
  @Get('/refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Redis에 담긴 Refresh Token을 이용해 Access Token 갱신',
  })
  async refresh(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;

    const { cookie } = this.authService.getToken('access', user.id);

    res.setHeader('Set-Cookie', [cookie]);

    res.send({ user });
  }

  // Access Token 으로 유저 정보 찾는 API
  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '유저 정보 찾기' })
  async findUserInfo(@Req() req: RequestUserInterface) {
    return req.user;
  }

  // 구글 로그인 API
  @Get('/google')
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: '구글 로그인' })
  async googleLogin() {
    return HttpStatus.OK;
  }

  // 구글 로그인 콜백 API
  @Get('/google/callback')
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: '구글 로그인 콜백' })
  async googleCallback(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;
    const { cookie: accessTokenCookie } = this.authService.getToken(
      'access',
      user.id,
    );
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user });
  }

  // 카카오 로그인 API
  @Get('kakao')
  @UseGuards(KakaoGuard)
  @ApiOperation({ summary: '카카오 로그인' })
  async kakaologin() {
    return HttpStatus.OK;
  }

  // 카카오 로그인 콜백 API
  @Get('kakao/callback')
  @UseGuards(KakaoGuard)
  @ApiOperation({ summary: '카카오 로그인 콜백' })
  async kakaoCallback(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;
    const { cookie: accessTokenCookie } = this.authService.getToken(
      'access',
      user.id,
    );
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user });
  }

  // 네이버 로그인 API
  @Get('/naver')
  @UseGuards(NaverGuard)
  @ApiOperation({ summary: '네이버 로그인' })
  async naverLogin() {
    return HttpStatus.OK;
  }

  // 네이버 로그인 콜백 API
  @Get('/naver/callback')
  @UseGuards(NaverGuard)
  @ApiOperation({ summary: '네이버 로그인 콜백' })
  async naverCallback(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;
    const { cookie: accessTokenCookie } = this.authService.getToken(
      'access',
      user.id,
    );
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user });
  }

  // 인증 번호 발송 API
  @Post('/email/send')
  @ApiOperation({ summary: '인증번호 발송' })
  @ApiBody({ description: 'email' })
  async sendOTP(@Body('email') email: string) {
    return await this.authService.sendEmailOTP(email);
  }

  // 인증 번호 확인 API
  @Post('/email/check')
  @ApiOperation({ summary: '인증번호 확인' })
  async checkOTP(@Body() dto: EmailValidationDto) {
    const { email, code } = dto;
    return await this.authService.checkEmailOTP(email, code);
  }
}
