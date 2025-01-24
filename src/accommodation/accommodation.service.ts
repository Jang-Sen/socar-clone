import {
  HttpException,
  HttpStatus,
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

@Injectable()
export class AccommodationService {
  constructor(
    @InjectRepository(Accommodation)
    private readonly repository: Repository<Accommodation>,
    private readonly minioClientService: MinioClientService,
  ) {}

  // 전체 조회
  async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Accommodation>> {
    // return await this.repository.find();
    const queryBuilder = this.repository.createQueryBuilder('accommodation');

    if (pageOptionsDto.keyword) {
      queryBuilder.andWhere('accommodation.name LIKE :keyword', {
        keyword: `${pageOptionsDto.keyword}`,
      });
    }

    queryBuilder
      .leftJoinAndSelect('accommodation.comments', 'comment')
      .addOrderBy(`accommodation.${pageOptionsDto.sort}`, pageOptionsDto.order)
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(entities, pageMetaDto);
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

    return '수정 완료';
  }
}
