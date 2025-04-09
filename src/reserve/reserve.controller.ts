import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: '예약 API' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createReserve(
    @Req() req: RequestUserInterface,
    @Body() dto: CreateReserveDto,
  ) {
    return await this.reserveService.createReserve(req.user, dto);
  }
}
