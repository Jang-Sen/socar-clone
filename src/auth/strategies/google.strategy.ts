import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { provider } = profile;
    const { name, picture, email } = profile._json;

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
          provider,
          email,
          username: name,
          profileImg: picture,
        });

        console.log('신규 계정');
        done(null, newUser);
      }
    }
  }
}
