import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '@mail/mail.module';
import { UserModule } from '@user/user.module';
import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { LocalStrategy } from '@auth/strategies/local.strategy';
import { AccessTokenStrategy } from '@auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@auth/strategies/refresh-token.strategy';
import { GoogleStrategy } from '@auth/strategies/google.strategy';
import { KakaoStrategy } from '@auth/strategies/kakao.strategy';
import { NaverStrategy } from '@auth/strategies/naver.strategy';

@Module({
  imports: [ConfigModule, UserModule, MailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
})
export class AuthModule {}
