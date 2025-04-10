import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReserveService } from './reserve.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReserveDto } from '@root/reserve/dto/create-reserve.dto';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

@ApiTags('예약 API')
@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '예약 생성',
    description: `
    로그인한 회원이 차량을 예약합니다.
      - 세부사항:
        - 중복 시간 예약 불가
    `,
  })
  @ApiBody({
    description: '예약 생성 DTO',
    type: CreateReserveDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createReserve(
    @Req() req: RequestUserInterface,
    @Body() dto: CreateReserveDto,
  ) {
    return await this.reserveService.createReserve(req.user, dto);
  }

  @Patch('/:id/status')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '예약 취소',
    description: `
    로그인한 회원이 예약했던 정보를 취소합니다.
      - 세부사항:
        - 해당 차량을 예약한 회원만 접근 가능
    `,
  })
  @ApiParam({
    name: 'id',
    description: '예약 ID',
  })
  async cancelReserve(
    @Req() req: RequestUserInterface,
    @Param('id') id: string,
  ) {
    return await this.reserveService.cancelReserve(req.user, id);
  }
}
