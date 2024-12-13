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
  @ApiBody({ type: CreateAccommodationDto })
  @ApiOperation({ summary: '숙소 생성' })
  async createAccommodation(@Body() dto: CreateAccommodationDto) {
    return await this.accommodationService.create(dto);
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
    type: CreateAccommodationDto,
    description: '숙소 수정 DTO',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
