import { Controller, Get, Param } from '@nestjs/common';
import { AccommodationService } from '@accommodation/accommodation.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Accommodation')
@Controller('accommodation')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get('/all')
  @ApiOperation({ summary: '전체 조회' })
  async findAll() {
    return await this.accommodationService.findAll();
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
}
