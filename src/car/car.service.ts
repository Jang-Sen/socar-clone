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
import { REDIS_CLIENT } from '@redis/redis.module';
import Redis from 'ioredis';
import { SortValue } from '@common/constant/sort.constant';

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);

  constructor(
    @InjectRepository(Car)
    private readonly repository: Repository<Car>,
    private readonly minioClientService: MinioClientService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
  }

  // 전체 찾기 로직
  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Car>> {
    const redisKey: string = `cars:${JSON.stringify(pageOptionsDto)}`;
    const redisData: string = await this.cache.get(redisKey);

    const queryBuilder = this.repository.createQueryBuilder('car');

    if (pageOptionsDto.modelName) {
      queryBuilder.andWhere('car.carName LIKE :carName', {
        carName: `%${pageOptionsDto.modelName}%`,
      });
    }

    if (pageOptionsDto.grade) {
      queryBuilder.andWhere('car.grade LIKE :grade', {
        grade: `%${pageOptionsDto.grade}%`,
      });
    }

    if (pageOptionsDto.fuel) {
      queryBuilder.andWhere('car.fuel = :fuel', {
        fuel: pageOptionsDto.fuel,
      });
    }

    if (pageOptionsDto.carYear) {
      queryBuilder.andWhere('car.carYear = :carYear', {
        carYear: pageOptionsDto.carYear,
      });
    }

    if (pageOptionsDto.carStatus) {
      queryBuilder.andWhere('car.carStatus = :carStatus', {
        carStatus: pageOptionsDto.carStatus,
      });
    }

    if (pageOptionsDto.minCarPrice) {
      queryBuilder.andWhere('car.price >= :minPrice', {
        minPrice: pageOptionsDto.minCarPrice,
      });
    }

    if (pageOptionsDto.maxCarPrice) {
      queryBuilder.andWhere('car.price <= :maxPrice', {
        maxPrice: pageOptionsDto.maxCarPrice,
      });
    }

    const sortOption = SortValue[pageOptionsDto.sort];

    queryBuilder
      .orderBy(`car.${sortOption.column}`, sortOption.order)
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();

    if (itemCount === 0) {
      throw new NotFoundException('등록된 차량이 존재하지 않습니다.');
    }

    if (redisData) {
      return JSON.parse(redisData);
    }

    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    const result = new PageDto(entities, pageMetaDto);

    await this.cache.set(redisKey, JSON.stringify(result));

    return result;
  }

  // ID에 맞는 차량 찾기 로직
  async findByCarId(id: string): Promise<Car> {
    const car = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        comments: true,
        reserves: true,
      },
    });

    if (!car) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    return car;
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
  async create(dto: CreateCarDto, carImgs?: BufferedFile[]) {
    const result = this.repository.create(dto);
    const savedCar = await this.repository.save(result);

    if (carImgs?.length) {
      savedCar.carImgs = await this.minioClientService.carImgsUpload(
        savedCar,
        carImgs,
        'car',
      );
    }

    await this.repository.save(savedCar);

    await this.clearCarCache();

    return result;
  }

  // 수정 로직
  async update(
    id: string,
    dto?: UpdateCarDto,
    files?: BufferedFile[],
  ): Promise<string> {
    const car = await this.findByCarId(id);
    const carFilesUrl = files.length
      ? await this.minioClientService.carImgsUpload(car, files, 'car')
      : [];

    const result = await this.repository.update(id, {
      ...dto,
      carImgs: carFilesUrl,
    });

    if (!result.affected) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    await this.clearCarCache();

    return '수정 완료';
  }

  // 삭제 로직
  async delete(id: string): Promise<string> {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('등록된 차량이 없습니다.');
    }

    await this.clearCarCache();

    return '삭제 완료';
  }

  // 엑셀 파일 업로드
  async insertExcel(cars: Partial<Car>[]): Promise<number> {
    if (cars.length === 0) return 0;

    // 이미 존재하는 차량 번호 조회
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

    await this.clearCarCache();

    return toInsert.length + toUpdate.length;
  }

  // Redis에 저장된 차량 데이터 삭제
  private async clearCarCache() {
    const keys = await this.redisClient.keys('cars:*');

    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
