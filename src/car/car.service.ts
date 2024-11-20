import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly repository: Repository<Car>,
  ) {}

  // 전체 찾기 로직
  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Car>> {
    // return await this.repository.find();
    const queryBuilder = this.repository.createQueryBuilder('car');

    queryBuilder
      .orderBy('car.createdAt', 'ASC')
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(entities, pageMetaDto);
  }

  // ID에 맞는 차량 찾기 로직
  async findByCarId(id: string) {
    const result = await this.repository.findOneBy({ id });

    if (!result) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return result;
  }

  // 차량 연료 or 분류로 찾는 로직 -> 맞는지 의문
  async findBy(key: 'scale' | 'fuel', value: string) {
    const result = await this.repository.findBy({ [key]: value });

    if (!result) {
      throw new NotFoundException(`'${key}' (으)로 검색된 차량이 없습니다.`);
    }

    return result;
  }

  // 생성 로직
  async create(dto: CreateCarDto) {
    const result = this.repository.create(dto);
    await this.repository.save(result);

    return result;
  }

  // 수정 로직
  async update(id: string, dto: UpdateCarDto) {
    const result = await this.repository.update(id, dto);

    if (!result) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return result;
  }

  // 삭제 로직
  async delete(id: string) {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return result;
  }
}
