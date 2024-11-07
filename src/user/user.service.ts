import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Provider } from './entities/provider.enum';
import * as bcrypt from 'bcryptjs';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  // 유저 생성 로직
  async createUser(dto: CreateUserDto) {
    const user = this.repository.create(dto);
    await this.repository.save(user);

    return user;
  }

  // ID or Email로 유저 찾기 로직
  async findBy(key: 'id' | 'email', value: string) {
    const user = await this.repository.findOneBy({ [key]: value });
    if (!user) {
      throw new NotFoundException(`존재하지 않는 ${key} 입니다.`);
    }

    return user;
  }

  // 비밀번호 변경 토큰을 이용한 비밀번호 변경 로직
  async updatePasswordWithToken(token: string, newPassword: string) {
    // 토큰이 일치한 지 확인
    const { email } = await this.jwtService.verify(token, {
      secret: this.configService.get('FIND_PASSWORD_TOKEN_SECRET'),
    });

    // 유저 확인
    const user = await this.findBy('email', email);

    // 소셜 로그인 유저 이용 불가
    if (user.provider !== Provider.LOCAL) {
      throw new HttpException(
        '소셜 로그인 유저는 이용하실 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 비밀번호 암호화
    const genSalt = await bcrypt.genSalt(10);
    const hashNewPassword = await bcrypt.hash(newPassword, genSalt);

    const result = await this.repository.update(user.id, {
      password: hashNewPassword,
    });

    if (!result.affected) {
      throw new BadRequestException('Bad Request');
    }

    return 'Update Password';
  }

  // Refresh Token -> Redis 저장
  async saveRefreshTokenInRedis(userId: string, refreshToken: string) {
    // 토큰 암호화
    const genSalt = await bcrypt.genSalt(10);
    const hashRefreshToken = await bcrypt.hash(refreshToken, genSalt);

    // Redis에 암호화한 토큰 저장
    await this.cache.set(userId, hashRefreshToken);
  }

  // Redis에 담긴 Refresh Token과 userId에 대한 Refresh Token이 일치하는지 검증
  async matchRefreshToken(userId: string, refreshToken: string) {
    // id 체크
    const user = await this.findBy('id', userId);
    // Redis에 담긴 id
    const redisUserId: string = await this.cache.get(user.id);

    // 비교
    const result = bcrypt.compare(refreshToken, redisUserId);

    if (result) {
      return user;
    }
  }
}
