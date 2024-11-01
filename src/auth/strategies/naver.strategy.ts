import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('NAVER_CLIENT_ID'),
      clientSecret: configService.get('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get('NAVER_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const { provider, displayName } = profile;
    const { email, profile_image } = profile._json;

    try {
      const user = await this.userService.findBy('email', email);
      if (user.provider !== provider) {
        throw new HttpException(
          `해당 이메일은 이미 ${user.provider}에 연동중입니다.`,
          HttpStatus.CONFLICT,
        );
      }
      console.log('기존 계정');
      done(null, user);
    } catch (e) {
      if (e.status === 404) {
        const newUser = await this.userService.createUser({
          email,
          username: displayName,
          provider,
          profileImg: profile_image,
        });
        console.log('신규 계정');
        done(null, newUser);
      }
    }
  }
}
