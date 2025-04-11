import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Accommodation } from '@accommodation/entities/accommodation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccommodationDto } from '@accommodation/dto/create-accommodation.dto';
import { UpdateAccommodationDto } from '@accommodation/dto/update-accommodation.dto';
import { MinioClientService } from '@minio-client/minio-client.service';
import { BufferedFile } from '@minio-client/interface/file.model';
import { PageDto } from '@common/dto/page.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { SortValue } from '@common/constant/sort.constant';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { REDIS_CLIENT } from '@redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectRepository(Accommodation)
    private readonly repository: Repository<Accommodation>,
    private readonly minioClientService: MinioClientService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  // 전체 조회
  async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Accommodation>> {
    const redisKey = `accommodations:${JSON.stringify(pageOptionsDto)}`;
    const redisData: string = await this.cache.get(redisKey);

    const queryBuilder = this.repository.createQueryBuilder('accommodation');

    if (pageOptionsDto.keyword) {
      queryBuilder.andWhere('accommodation.name LIKE :keyword', {
        keyword: `%${pageOptionsDto.keyword}%`,
      });
    }

    const sortOption = SortValue[pageOptionsDto.sort];

    queryBuilder
      .addOrderBy(`accommodation.${sortOption.column}`, sortOption.order)
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();

    if (itemCount === 0) {
      throw new NotFoundException('등록된 숙소가 존재하지 않습니다.');
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

  // 상세 조회
  async findById(id: string) {
    const accommodation = await this.repository.findOneBy({ id });

    if (!accommodation) {
      throw new NotFoundException('해당 숙소를 찾을 수 없습니다.');
    }

    return accommodation;
  }

  // 생성
  async create(dto: CreateAccommodationDto, imgs: BufferedFile[]) {
    try {
      const accommodation = this.repository.create(dto);
      const savedAd = await this.repository.save(accommodation);

      if (imgs.length) {
        savedAd.accommodationImgs =
          await this.minioClientService.accommodationImgsUpload(
            savedAd,
            imgs,
            'accommodation',
          );
      }

      await this.repository.save(savedAd);

      await this.clearAccommodationCache();

      return accommodation;
    } catch (e) {
      throw new HttpException(
        `생성 도중 에러 발생: ${e.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // const accommodation = this.repository.create(dto);
    //
    // if (!accommodation) {
    //   throw new HttpException('생성 불가', HttpStatus.BAD_REQUEST);
    // }
    // await this.repository.save(accommodation);
    //
    // return accommodation;
  }

  // 삭제
  async delete(id: string): Promise<string> {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('삭제할 숙소의 ID가 아닙니다.');
    }

    await this.clearAccommodationCache();

    return '삭제 완료';
  }

  // 수정
  async update(
    id: string,
    dto?: UpdateAccommodationDto,
    imgs?: BufferedFile[],
  ): Promise<string> {
    const accommodation = await this.findById(id);
    const imgsUrl = await this.minioClientService.accommodationImgsUpload(
      accommodation,
      imgs,
      'accommodation',
    );
    const result = await this.repository.update(id, {
      ...dto,
      accommodationImgs: imgsUrl,
    });

    if (!result.affected) {
      throw new NotFoundException('숙소의 정보를 수정할 수 없습니다.');
    }

    await this.clearAccommodationCache();

    return '수정 완료';
  }

  private async clearAccommodationCache() {
    const keys = await this.redisClient.keys('accommodations:*');

    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
