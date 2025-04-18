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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('인증 API')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // 회원가입 API
  @Post('/signup')
  @ApiOperation({
    summary: '회원가입',
    description: `
    회원의 정보를 입력하여 DB에 저장합니다.
      - 세부사항:
        - 비밀번호는 최소 8자리, 최소 하나의 문자, 하나의 숫자 및 특수문자 포함
    `,
  })
  @ApiCreatedResponse({
    description: '회원가입 완료',
    type: CreateUserDto,
  })
  async signup(@Body() dto: CreateUserDto) {
    return await this.authService.signup(dto);
  }

  // 로그인 API
  @Post('/login')
  @UseGuards(LocalGuard)
  @ApiOperation({
    summary: '로그인',
    description: `
    DB에 저장된 회원이 로그인 합니다.
      - 세부사항:
        - 로그인 성공 시, Access/Refresh Token이 쿠키에 저장
        - Redis에 Refresh Token 저장
    `,
  })
  @ApiCreatedResponse({
    description: '로그인 완료',
    type: CreateUserDto,
  })
  @ApiNotFoundResponse({
    description: '해당 이메일을 찾을 수 없음',
  })
  @ApiBadRequestResponse({
    description: '비밀번호 불일치',
  })
  @ApiBody({ description: '로그인 DTO', type: LoginUserDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async login(@Req() req: RequestUserInterface, @Res() res: Response) {
    const user = req.user;
    const { token: accessToken, cookie: accessTokenCookie } =
      this.authService.getToken('access', user.id);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    // Refresh Token -> Redis 에 담기
    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    // Token -> Cookie 에 담기
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user, accessToken });
    // return { user, accessToken, refreshToken };
  }

  // 비밀번호 변경 이메일 보내기 API
  @Post('/find/password')
  @ApiOperation({
    summary: '비밀번호 변경 메일 전송',
    description: `
    비밀번호를 잊어버린 회원의 이메일에 비밀번호 변경 메일을 전송합니다.
      - 세부사항:
        - 메일에 비밀번호 변경 토큰을 URL에 추가
    `,
  })
  @ApiCreatedResponse({
    description: '비밀번호 변경 메일 전송 성공',
  })
  @ApiBody({ description: '이메일 DTO', type: EmailDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async findPassword(@Body() dto: EmailDto) {
    return await this.authService.findPasswordSendEmail(dto.email);
  }

  // 비밀번호 변경 API
  @Post('/update/password')
  @ApiOperation({
    summary: '비밀번호 변경',
    description: `
    회원의 이메일에 전송된 메일 URL에 있는 비밀번호 변경 토큰을 이용해 비밀번호 변경합니다.
      - 세부사항:
        - 메일 URL에 있는 토큰이 일치한 경우만 변경 가능
    `,
  })
  @ApiCreatedResponse({
    description: '비밀번호 변경 성공',
  })
  @ApiBody({ description: '비밀번호 변경 DTO', type: UpdatePasswordDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return await this.userService.updatePasswordWithToken(
      dto.token,
      dto.password,
    );
  }

  // 인증 번호 발송 API
  @Post('/email/send')
  @ApiOperation({
    summary: '인증번호 발송',
    description: `
    회원가입 시, 이메일 인증을 위한 인증번호를 발송합니다.
      - 세부사항:
        - 인증번호는 Redis에 회원의 이메일을 key값으로 저장
    `,
  })
  @ApiCreatedResponse({
    description: '이메일 인증번호 전송 성공',
  })
  @ApiBody({ description: '이메일 DTO', type: EmailDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async sendOTP(@Body() emailDto: EmailDto) {
    return await this.authService.sendEmailOTP(emailDto.email);
  }

  // 인증 번호 확인 API
  @Post('/email/check')
  @ApiOperation({
    summary: '인증번호 확인',
    description: `
    회원의 이메일로 발송된 인증번호와 입력한 인증번호가 일치하는지 확인합니다.
      - 세부사항:
        - Redis에 회원의 이메일로 저장된 인증번호가 일치하는지 확인
    `,
  })
  @ApiCreatedResponse({
    description: '인증번호 확인 성공',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async checkOTP(@Body() dto: EmailValidationDto) {
    const { email, code } = dto;
    return await this.authService.checkEmailOTP(email, code);
  }

  // Refresh Token을 이용해 Access Token 갱신
  @Get('/refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Access Token 갱신',
    description: `
    Redis에 담긴 Refresh Token을 이용해 Access Token을 갱신합니다.
      - 세부사항:
        - 갱신된 Access Token은 쿠키에 저장
    `,
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
  @ApiOperation({
    summary: '유저 정보 찾기',
    description: `
    로그인한 유저가 자신의 정보를 확인합니다.
      - 세부사항:
        - 로그인 시(Access Token을 보유할 시) 접근 가능
    `,
  })
  @ApiOkResponse({
    description: '개인 정보 확인',
  })
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
    const { token: accessToken, cookie: accessTokenCookie } =
      this.authService.getToken('access', user.id);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user, accessToken });
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
    const { token: accessToken, cookie: accessTokenCookie } =
      this.authService.getToken('access', user.id);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user, accessToken });
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
    const { token: accessToken, cookie: accessTokenCookie } =
      this.authService.getToken('access', user.id);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getToken('refresh', user.id);

    await this.userService.saveRefreshTokenInRedis(user.id, refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send({ user, accessToken });
  }
}
