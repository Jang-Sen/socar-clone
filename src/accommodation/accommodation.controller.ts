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

@ApiTags('숙소 API')
@Controller('accommodation')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get('/all')
  @ApiOperation({
    summary: '숙소 전체 조회',
    description: `
    DB에 저장되어 있는 숙소의 목록을 조회합니다.
      - 세부사항:
        - 페이지네이션(Pagination) 지원 (예: 페이지당 10건)
        - 숙소명으로 필터링 할 수 있는 검색 기능 제공
        - 정렬 기능 제공
    `,
  })
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Accommodation>> {
    return await this.accommodationService.findAll(pageOptionsDto);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    description: '숙소 ID',
  })
  @ApiOperation({
    summary: '숙소 상세 조회',
    description: `
    DB에 등록되어 있는 숙소의 ID로 숙소를 조회합니다.
    `,
  })
  async findByAccommodationId(@Param('id') id: string) {
    return await this.accommodationService.findById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('accommodationImgs'))
  @ApiBody({
    description: '숙소 생성 DTO',
    type: CreateAccommodationDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '숙소 생성',
    description: `
    DB에 숙소의 정보를 저장합니다.
      - 세부사항:
        - 숙소의 이미지는 10개 까지 등록 가능 
    `,
  })
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
  })
  @ApiOperation({ summary: '숙소 삭제' })
  async deleteAccommodation(@Param('id') id: string) {
    return await this.accommodationService.delete(id);
  }

  @Put('/:id')
  @UseInterceptors(FilesInterceptor('accommodationImgs'))
  @ApiParam({
    name: 'id',
    description: '숙소 ID',
  })
  @ApiBody({
    description: '숙소 수정 DTO',
    type: UpdateAccommodationDto,
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
