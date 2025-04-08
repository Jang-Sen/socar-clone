import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '@root/profile/entities/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from '@root/profile/dto/create-profile.dto';
import { User } from '@user/entities/user.entity';
import { UpdateProfileDto } from '@root/profile/dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly repository: Repository<Profile>,
  ) {}

  // 프로필 생성 로직
  async createProfile(user: User, dto: CreateProfileDto): Promise<Profile> {
    const profile = this.repository.create({ id: user.id, ...dto });

    return await this.repository.save(profile);
  }

  // 프로필 수정 로직
  async updateProfile(user: User, dto: UpdateProfileDto): Promise<string> {
    const result = await this.repository.update(user.id, dto);

    if (!result.affected) {
      throw new BadRequestException('Fail Updated Profile.');
    }

    return '프로필 수정 완료';
  }
}
