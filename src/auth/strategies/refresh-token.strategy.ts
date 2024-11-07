import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { RequestUserInterface } from '../interface/requestUser.interface';
import { TokenPayloadInterface } from '../interface/tokenPayload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    @Req() req: RequestUserInterface,
    payload: TokenPayloadInterface,
  ) {
    const refreshToken = req.headers.authorization
      ?.replace('bearer', '')
      .trim();

    const user = await this.userService.matchRefreshToken(
      payload.userId,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token 입니다.');
    }

    return user;
  }
}
