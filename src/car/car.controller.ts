import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
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
import { RoleGuard } from '@auth/guards/role.guard';
import { Role } from '@user/entities/role.enum';
import { CreateCarDto } from '@car/dto/create-car.dto';
import { UpdateCarDto } from '@car/dto/update-car.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Fuel } from '@car/entities/fuel.enum';
import * as XLSX from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@ApiTags('차량 API')
@Controller('car')
export class CarController {
  private readonly logger = new Logger();

  constructor(private readonly carService: CarService) {}

  // 전체 찾기 API
  @Get('/findAll')
  @ApiOperation({
    summary: '차량 전체 조회',
    description: `
    DB에 등록되어 있는 차량 목록을 조회합니다.
      - 세부사항:
        - 페이지네이션(Pagination) 지원 (예: 페이지당 10건)
        - 차량명으로 필터링할 수 있는 검색 기능 제공 (두글자 이상 입력)
        - 정렬 기능 제공 (예: 최근 등록순)
        - Redis에 차량 조회 데이터 저장 (TTL: 600)
        - 조회 데이터가 Redis에 저장된 데이터와 일치할 경우, Redis에 저장되어 있는 차량 데이터로 조회 (캐싱)
    `,
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.carService.findAll(pageOptionsDto);
  }

  // 차량 ID로 찾기 API
  @Get('/find/:id')
  @ApiOperation({
    summary: '특정 차량 조회',
    description: `
    DB에 등록되어 있는 차량의 ID로 차량을 조회합니다.
    `,
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
  })
  async findByCarId(@Param('id') id: string) {
    return await this.carService.findByCarId(id);
  }

  // 등록 API
  @Post('/create')
  @UseGuards(RoleGuard(Role.ADMIN))
  @UseInterceptors(FilesInterceptor('carImgs'))
  @ApiOperation({
    summary: `차량 등록 - ${Role.ADMIN}`,
    description: `
    DB에 차량의 정보를 등록합니다.
      - 세부사항:
        - ${Role.ADMIN}만 접근 가능
        - 차량에 대한 이미지는 5개 까지 등록 가능
        - Redis에 저장되어있는 차량 조회 데이터 삭제 (데이터 일관성 보장)
    `,
  })
  @ApiBody({ description: '차량 등록 DTO', type: CreateCarDto })
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() dto: CreateCarDto,
    @UploadedFiles() carImgs?: BufferedFile[],
  ) {
    return await this.carService.create(dto, carImgs);
  }

  @Post()
  @UseGuards(RoleGuard(Role.ADMIN))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: `엑셀 파일 업로드를 통한 등록 - ${Role.ADMIN}`,
    description: `
    엑셀 파일을 업로드하여 DB에 차량의 정보를 등록합니다.
      - 세부사항:
        - ${Role.ADMIN}만 접근 가능
        - Redis에 저장되어있는 차량 조회 데이터 삭제 (데이터 일관성 보장)
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 Excel 파일(.xlsx)',
        },
      },
    },
  })
  async insertExcel(@UploadedFile() file: any) {
    const workBook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workBook.Sheets[workBook.SheetNames[0]];
    const datas: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const totalRows = datas.length;

    const dtos = await Promise.all(
      datas.map(async (data) => {
        const dto = plainToInstance(CreateCarDto, {
          carName: data['차량명']?.toString(),
          grade: data['등급']?.toString(),
          carYear: data['연식'] ? Number(data['연식']) : undefined,
          carNo: data['차량no.']?.toString(),
          price: data['제시금액'] ? Number(data['제시금액']) : undefined,
          transmission: data['변속기']?.toString(),
          mileage: data['주행거리'] ? Number(data['주행거리']) : undefined,
          displacement: data['배기량'] ? Number(data['배기량']) : undefined,
          fuel: data['연료']?.toString() as Fuel,
        });

        const error = await validate(dto);
        return error.length === 0 ? dto : null;
      }),
    );

    const validDtos = dtos.filter((dto): dto is CreateCarDto => dto !== null);

    const processed = await this.carService.insertExcel(validDtos);

    const skippedRows = totalRows - processed;

    this.logger.log(
      `✅ 저장된 데이터 수: ${processed}, ❌ 스킵된 데이터 수: ${skippedRows}`,
    );

    return { totalRows, processed, skippedRows };
  }

  // 수정 API
  @Put('/:id')
  @UseGuards(RoleGuard(Role.ADMIN))
  @UseInterceptors(FilesInterceptor('carImgs'))
  @ApiOperation({
    summary: `차량 수정 - ${Role.ADMIN}`,
    description: `
    DB에 저장된 차량의 ID로 등록되어있는 차량의 정보를 수정합니다.
      - 세부사항:
        - ${Role.ADMIN}만 접근 가능
        - 차량에 대한 이미지는 5개 까지 등록 가능
        - Redis에 저장되어있는 차량 조회 데이터 삭제 (데이터 일관성 보장)
    `,
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
  })
  @ApiBody({
    description: '차량 수정 DTO',
    type: CreateCarDto,
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
    summary: `차량 삭제 - ${Role.ADMIN}`,
    description: `
    DB에 저장된 차량의 ID로 등록되어있는 차량의 정보를 삭제합니다.
      - 세부사항:
        - ${Role.ADMIN}만 접근 가능
        - Redis에 저장되어있는 차량 조회 데이터 삭제 (데이터 일관성 보장)
    `,
  })
  @ApiParam({
    name: 'id',
    description: '차량 ID',
  })
  async delete(@Param('id') id: string) {
    return await this.carService.delete(id);
  }
}
