import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalGuard } from './guards/local.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { RequestUserInterface } from './interface/requestUser.interface';
import { JwtGuard } from './guards/jwt.guard';
import { GoogleGuard } from './guards/google.guard';
import { KakaoGuard } from './guards/kakao.guard';
import { NaverGuard } from './guards/naver.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async login(@Req() req: RequestUserInterface) {
    const user = req.user;
    const token = await this.authService.getAccessToken(user.id);

    return { user, token };
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
  async googleCallback(@Req() req: RequestUserInterface) {
    const user = req.user;
    const token = await this.authService.getAccessToken(user.id);

    return { user, token };
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
  async kakaoCallback(@Req() req: RequestUserInterface) {
    const user = req.user;
    const token = await this.authService.getAccessToken(user.id);

    return { user, token };
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
  async naverCallback(@Req() req: RequestUserInterface) {
    const user = req.user;
    const token = await this.authService.getAccessToken(user.id);

    return { user, token };
  }

  // Access Token 으로 유저 정보 찾는 API
  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 정보 찾기' })
  async findUserInfo(@Req() req: RequestUserInterface) {
    return req.user;
  }

  // 인증 번호 발송 API
  @Post('/email/send')
  @ApiOperation({ summary: '인증번호 발송' })
  @ApiBody({ description: 'email' })
  async sendOTP(@Body('email') email: string) {
    return await this.authService.sendEmailOTP(email);
  }
}
