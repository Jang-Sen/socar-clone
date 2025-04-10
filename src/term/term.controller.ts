import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { TermService } from './term.service';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';

@ApiTags('이용약관 API')
@ApiCookieAuth()
@Controller('term')
export class TermController {
  constructor(private readonly termService: TermService) {}

  // 이용약관 생성 API
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '이용약관 생성',
    description: `
    회원의 이용약관을 생성합니다.
      - 세부사항:
        - 소셜 로그인 회원 이용
    `,
  })
  @ApiBody({ description: '이용약관 DTO', type: CreateTermDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createTerm(
    @Req() req: RequestUserInterface,
    @Body() dto: CreateTermDto,
  ) {
    return await this.termService.create(req.user, dto);
  }

  // 이용약관 수정 API
  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '이용약관 수정' })
  @ApiBody({ description: '이용약관 DTO', type: UpdateTermDto })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateTerm(
    @Req() req: RequestUserInterface,
    @Body() dto: UpdateTermDto,
  ) {
    return await this.termService.update(req.user, dto);
  }
}
