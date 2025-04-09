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
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateReserveDto } from '@root/reserve/dto/create-reserve.dto';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '예약 생성 API',
    description: '로그인한 회원이 자동차를 예약합니다. 중복 시간에 예약 불가',
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
    summary: '예약 취소 API',
    description: '로그인한 회원이 예약했던 정보를 취소합니다.',
  })
  async cancelReserve(
    @Req() req: RequestUserInterface,
    @Param('id') id: string,
  ) {
    return await this.reserveService.cancelReserve(req.user, id);
  }
}
