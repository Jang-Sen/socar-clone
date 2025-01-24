import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AccommodationService } from '@accommodation/accommodation.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccommodationDto } from '@accommodation/dto/create-accommodation.dto';
import { UpdateAccommodationDto } from '@accommodation/dto/update-accommodation.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PageDto } from '@common/dto/page.dto';
import { Accommodation } from '@accommodation/entities/accommodation.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { AccommodationType } from '@accommodation/entities/accommodation-type.enum';

@ApiTags('Accommodation')
@Controller('accommodation')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get('/all')
  @ApiOperation({ summary: '숙소 전체 조회' })
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Accommodation>> {
    return await this.accommodationService.findAll(pageOptionsDto);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    description: '숙소 ID',
    example: '123',
  })
  @ApiOperation({ summary: '숙소 ID로 상세 조회' })
  async findByAccommodationId(@Param('id') id: string) {
    return await this.accommodationService.findById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('imgs'))
  @ApiBody({
    description: '숙소 생성 DTO',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '숙소 이름',
          example: '양양 모닝비치팬션',
        },
        area: {
          type: 'string',
          description: '지역',
          example: '강원 양양군',
        },
        accommodationType: {
          type: 'enum',
          description: '종류',
          example: AccommodationType.PENSION,
        },
        // reservatedAt: {
        //   type: 'Date',
        //   description: '예약 날짜',
        // },
        price: {
          type: 'number',
          description: '가격',
          example: 75000,
        },
        personnel: {
          type: 'number',
          description: '인원',
          example: 2,
        },
        information: {
          type: 'string',
          description: '숙소 정보',
          example: '해수욕장인근, 바다전망, 주차가능, 와이파이, 스파/월풀/욕조',
        },
        imgs: {
          type: 'array',
          description: '숙소 이미지(10개 이하)',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '숙소 생성' })
  async createAccommodation(
    @Body() dto: CreateAccommodationDto,
    @UploadedFiles() imgs: BufferedFile[],
  ) {
    return await this.accommodationService.create(dto, imgs);
  }

  @Delete('/:id')
  @ApiParam({
    name: 'id',
    description: '숙소 ID',
    example: 'uuid',
  })
  @ApiOperation({ summary: '숙소 삭제' })
  async deleteAccommodation(@Param('id') id: string) {
    return await this.accommodationService.delete(id);
  }

  @Put('/:id')
  @UseInterceptors(FilesInterceptor('imgs'))
  @ApiParam({
    name: 'id',
    description: '숙소 ID',
    example: 'uuid',
  })
  @ApiBody({
    description: '숙소 수정 DTO',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '숙소 이름',
          example: '양양 모닝비치팬션',
        },
        area: {
          type: 'string',
          description: '지역',
          example: '강원 양양군',
        },
        accommodationType: {
          type: 'enum',
          description: '종류',
          example: AccommodationType.PENSION,
        },
        // reservatedAt: {
        //   type: 'Date',
        //   description: '예약 날짜',
        // },
        price: {
          type: 'number',
          description: '가격',
          example: 75000,
        },
        personnel: {
          type: 'number',
          description: '인원',
          example: 2,
        },
        information: {
          type: 'string',
          description: '숙소 정보',
          example: '해수욕장인근, 바다전망, 주차가능, 와이파이, 스파/월풀/욕조',
        },
        imgs: {
          type: 'array',
          description: '숙소 이미지(10개 이하)',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '숙소 수정' })
  async updateAccommodation(
    @Param('id') id: string,
    @Body() dto?: UpdateAccommodationDto,
    @UploadedFiles() imgs?: BufferedFile[],
  ) {
    return await this.accommodationService.update(id, dto, imgs);
  }
}
