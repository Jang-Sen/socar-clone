import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalGuard } from './guards/local.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { RequestUserInterface } from './interface/requestUser.interface';

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
    const token = this.authService.getAccessToken(user.id);

    return { user, token };
  }
}