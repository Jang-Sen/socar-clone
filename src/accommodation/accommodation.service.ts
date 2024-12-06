import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Accommodation } from '@accommodation/entities/accommodation.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectRepository(Accommodation)
    private readonly repository: Repository<Accommodation>,
  ) {}

  // 전체 조회
  async findAll() {
    return await this.repository.find();
  }

  // 상세 조회
  async findById(id: string) {
    const accommodation = await this.repository.findOneBy({ id });

    if (!accommodation) {
      throw new NotFoundException('해당 숙소를 찾을 수 없습니다.');
    }

    return accommodation;
  }
}
