import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '@car/entities/car.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { PageDto } from '@common/dto/page.dto';
import { CreateCarDto } from '@car/dto/create-car.dto';
import { UpdateCarDto } from '@car/dto/update-car.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { MinioClientService } from '@minio-client/minio-client.service';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);

  constructor(
    @InjectRepository(Car)
    private readonly repository: Repository<Car>,
    private readonly minioClientService: MinioClientService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // 전체 찾기 로직
  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Car>> {
    // return await this.repository.find();
    const redisCar: any = await this.cache.get('car');

    const queryBuilder = this.repository.createQueryBuilder('car');

    if (pageOptionsDto.keyword) {
      queryBuilder.andWhere('car.carName LIKE :carName', {
        carName: `%${pageOptionsDto.keyword}%`,
        // keyword: pageOptionsDto.keyword,
      });
    }

    queryBuilder
      .leftJoinAndSelect('car.comments', 'comment')
      .orderBy(`car.${pageOptionsDto.sort}`, pageOptionsDto.order)
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    // if (redisCar) {
    //   console.log('Redis에 저장된 데이터 조회');
    //   return new PageDto(redisCar, pageMetaDto);
    // } else {
    //   console.log('DB에 있는 데이터 조회(Redis에 데이터 저장)');
    //   await this.cache.set('car', entities);
    return new PageDto(entities, pageMetaDto);
    // }
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
  async create(dto: CreateCarDto, carImgs: BufferedFile[]) {
    const result = this.repository.create(dto);
    const savedCar = await this.repository.save(result);

    if (carImgs.length) {
      savedCar.carImgs = await this.minioClientService.carImgsUpload(
        savedCar,
        carImgs,
        'car',
      );
    }

    await this.repository.save(savedCar);

    await this.cache.del('car');

    return result;
  }

  // 수정 로직
  async update(
    id: string,
    dto?: UpdateCarDto,
    files?: BufferedFile[],
  ): Promise<string> {
    const car = await this.findByCarId(id);
    const carFilesUrl = await this.minioClientService.carImgsUpload(
      car,
      files,
      'car',
    );

    const result = await this.repository.update(id, {
      ...dto,
      carImgs: carFilesUrl,
    });

    if (!result.affected) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return '수정 완료';
  }

  // 삭제 로직
  async delete(id: string): Promise<string> {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return '삭제 완료';
  }

  // 엑셀 파일 업로드
  async insertExcel(cars: Partial<Car>[]): Promise<number> {
    if (cars.length === 0) return 0;

    // 이미 존재하는 자동차 번호 조회
    const existings = await this.repository.find({
      where: cars.map((car) => ({
        carNo: car.carNo,
      })),
    });

    const existingMap = new Map(
      existings.map((value) => [`${value.carNo}`, value]),
    );

    const toInsert: Partial<Car>[] = [];
    const toUpdate: { id: string; data: Partial<Car> }[] = [];

    for (const car of cars) {
      const key = `${car.carNo}`;
      const existing = existingMap.get(key);

      if (existing) {
        toUpdate.push({ id: existing.id, data: car });
      } else {
        toInsert.push(car);
      }
    }

    if (toInsert.length) await this.repository.save(toInsert);

    for (const { id, data } of toUpdate) {
      await this.repository.update(id, data);
    }

    return toInsert.length + toUpdate.length;
  }
}
