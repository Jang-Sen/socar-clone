import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
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
      throw new NotFoundException(`${key} 에 맞는 유저가 없습니다.`);
    }

    return user;
  }
}
