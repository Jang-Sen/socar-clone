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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CarService } from './car.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { FindCarDto } from '@car/dto/find-car.dto';
import { RoleGuard } from '@auth/guards/role.guard';
import { Role } from '@user/entities/role.enum';
import { CreateCarDto } from '@car/dto/create-car.dto';
import { UpdateCarDto } from '@car/dto/update-car.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Car')
@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  // 전체 찾기 API
  @Get('/findAll')
  @ApiOperation({
    summary: '차량 전체 찾기',
    description: '등록되어있는 차량 전체 검색(페이징)',
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.carService.findAll(pageOptionsDto);
  }

  // 차량 ID로 찾기 API
  @Get('/find/:id')
  @ApiOperation({
    summary: 'ID로 차량 검색',
    description: 'ID로 등록되어있는 차량을 검색',
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
    example: '123',
  })
  async findByCarId(@Param('id') id: string) {
    return await this.carService.findByCarId(id);
  }

  // 차량 연료 or 분류로 찾기 API -> 이게 맞는지 잘 모르겠음
  @Get('/find/:dto')
  @ApiOperation({
    summary: '연료 or 분류로 차량 검색',
  })
  @ApiParam({
    name: 'dto',
    type: FindCarDto,
    description: '차량의 연료 or 분류',
    example: '하이브리드 | 중형',
  })
  async findBy(@Param('dto') dto: FindCarDto, key: string) {
    if (key === 'scale') {
      // 연료로 차량을 검색할 때
      return await this.carService.findBy('scale', dto.scale);
    } else if (key === 'fuel') {
      // 분류로 검색할 때
      return await this.carService.findBy('fuel', dto.fuel);
    }
  }

  // 등록 API
  @Post('/create')
  // @UseGuards(RoleGuard(Role.ADMIN))
  @ApiOperation({
    summary: '차량 등록',
    description: `${Role.ADMIN}만 이용가능`,
  })
  @ApiBody({
    description: '차량 등록 DTO',
    type: CreateCarDto,
  })
  async create(@Body() dto: CreateCarDto) {
    return await this.carService.create(dto);
  }

  // 수정 API
  @Put('/:id')
  // @UseGuards(RoleGuard(Role.ADMIN))
  @UseInterceptors(FilesInterceptor('carImgs'))
  @ApiOperation({
    summary: '차량 수정',
    description: `ID로 등록되어있는 차량의 정보 수정, ${Role.ADMIN}만 이용가능`,
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
    example: '123',
  })
  @ApiBody({
    description: '차량 수정 DTO',
    schema: {
      type: 'object',
      properties: {
        carName: {
          type: 'string',
          description: '자동차 이름',
          example: 'K5',
        },
        price: {
          type: 'number',
          description: '자동차 가격',
          example: 23000,
        },
        carImgs: {
          type: 'array',
          description: '자동차 이미지',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() dto?: UpdateCarDto,
    @UploadedFiles() carImgs?: BufferedFile[],
  ) {
    return await this.carService.update(id, dto, carImgs);
  }

  // 삭제 API
  @Delete('/:id')
  @UseGuards(RoleGuard(Role.ADMIN))
  @ApiOperation({
    summary: '차량 삭제',
    description: `ID로 등록되어있는 차량을 삭제, ${Role.ADMIN}만 이용가능`,
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
    example: '123',
  })
  async delete(@Param('id') id: string) {
    return await this.carService.delete(id);
  }
}
