import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const { provider, username } = profile;
    const { profile_image } = profile._json.properties;
    const { email } = profile._json.kakao_account;

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
          username,
          email,
          provider,
          profileImg: profile_image,
        });

        console.log('신규 계정');
        done(null, newUser);
      }
    }
  }
}
