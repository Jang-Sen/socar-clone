import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { MinioClientService } from '@minio-client/minio-client.service';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { PageDto } from '@common/dto/page.dto';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { ResetPasswordDto } from '@user/dto/reset-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly minioClientService: MinioClientService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {
  }

  // 유저 생성 로직
  async createUser(dto: CreateUserDto) {
    const existing = await this.repository.findOneBy({ email: dto.email });

    if (existing) {
      throw new BadRequestException('이미 존재하는 계정입니다.');
    }

    const user = this.repository.create(dto);
    await this.repository.save(user);

    return user;
  }

  // 전체 유저 찾기 로직
  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    if (pageOptionsDto.modelName) {
      queryBuilder.andWhere('user.username = :username', {
        username: pageOptionsDto.modelName,
      });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();

    if (itemCount === 0) {
      throw new NotFoundException('회원이 존재하지 않습니다.');
    }

    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(entities, pageMetaDto);
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
    const result = await bcrypt.compare(refreshToken, redisUserId);

    if (result) {
      return user;
    }
  }

  // 유저 프로필 사진 변경
  async updateProfileByToken(
    user: User,
    dto?: UpdateUserDto,
    img?: BufferedFile[],
  ) {
    const profileUrl = img.length
      ? await this.minioClientService.profileImgUpload(user, img, 'profile')
      : [];
    const updateResult = await this.repository.update(user.id, {
      ...dto,
      profileImg: profileUrl,
    });

    if (!updateResult.affected) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }

    return '프로필 사진 수정 완료';
  }

  // 유저 생성 (관리자)
  async createUserFromAdmin(dto: CreateUserDto, profileImg?: BufferedFile[]) {
    const existing = await this.repository.findOneBy({ email: dto.email });

    if (existing) {
      throw new BadRequestException('이미 존재하는 회원입니다.');
    }

    const user = this.repository.create({
      provider: Provider.LOCAL,
      ...dto,
    });
    const saveUser = await this.repository.save(user);

    const profileUrl = profileImg.length
      ? await this.minioClientService.profileImgUpload(
        saveUser,
        profileImg,
        'profile',
      )
      : [];

    if (profileUrl.length > 0) {
      saveUser.profileImg = profileUrl;
      await this.repository.save(saveUser);
    }

    return user;
  }

  // 로그인 후, 패스워드 변경 로직
  async resetPasswordAfterLogin(user: User, dto: ResetPasswordDto) {
    const existing = await this.findBy('email', user.email);

    if (existing.provider !== Provider.LOCAL) {
      throw new BadRequestException('소셜 로그인 고객은 이용할 수 없습니다.');
    }

    const genSalt = await bcrypt.genSalt(10);
    const hashNewPassword = await bcrypt.hash(dto.password, genSalt);

    const result = await this.repository.update(existing.id, {
      password: hashNewPassword,
    });

    if (!result.affected) {
      throw new BadRequestException('Bad Request');
    }

    return 'Update Password';
  }
}
