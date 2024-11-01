import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { TermService } from './term.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateTermDto } from './dto/create-term.dto';
import { RequestUserInterface } from '../auth/interface/requestUser.interface';
import { UpdateTermDto } from './dto/update-term.dto';

@ApiTags('Term')
@ApiBearerAuth()
@Controller('term')
export class TermController {
  constructor(private readonly termService: TermService) {}

  // 이용약관 생성 API
  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '이용약관 생성' })
  @ApiBody({ description: '이용약관 DTO', type: CreateTermDto })
  async createTerm(
    @Req() req: RequestUserInterface,
    @Body() dto: CreateTermDto,
  ) {
    return await this.termService.create(req.user, dto);
  }

  // 이용약관 수정 API
  @Put()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '이용약관 수정' })
  @ApiBody({ description: '이용약관 DTO', type: CreateTermDto })
  async updateTerm(
    @Req() req: RequestUserInterface,
    @Body() dto: UpdateTermDto,
  ) {
    return await this.termService.update(req.user, dto);
  }
}
