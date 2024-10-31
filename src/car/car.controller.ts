import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CarService } from './car.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { FindCarDto } from './dto/find-car.dto';

@ApiTags('Car')
@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  // 전체 찾기 API
  @Get('/findAll')
  @ApiOperation({
    summary: '차량 전체 찾기',
    description: '등록되어있는 차량 전체 검색',
  })
  async findAll() {
    return await this.carService.findAll();
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
  @ApiOperation({
    summary: '차량 등록',
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
  @ApiOperation({
    summary: '차량 수정',
    description: 'ID로 등록되어있는 차량의 정보 수정',
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
    example: '123',
  })
  @ApiBody({
    description: '차량 수정 DTO',
    type: CreateCarDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return await this.carService.update(id, dto);
  }

  // 삭제 API
  @Delete('/:id')
  @ApiOperation({
    summary: '차량 삭제',
    description: 'ID로 등록되어있는 차량을 삭제',
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
