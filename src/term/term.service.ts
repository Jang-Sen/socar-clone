import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';
import { Repository } from 'typeorm';
import { CreateTermDto } from './dto/create-term.dto';
import { User } from '../user/entities/user.entity';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private repository: Repository<Term>,
  ) {}

  // 생성 로직
  async create(user: User, dto: CreateTermDto) {
    const term = this.repository.create({ user, ...dto });
    await this.repository.save(term);

    return term;
  }

  // 수정 로직
  async update(user: User, dto: UpdateTermDto) {
    const result = await this.repository.update({ id: user.term.id }, dto);
    if (!result.affected) {
      throw new BadRequestException('error');
    }

    return result;
  }
}
