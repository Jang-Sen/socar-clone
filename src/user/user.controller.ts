import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from './entities/role.enum';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@ApiTags('User')
@Controller('user')
@UseGuards(RoleGuard(Role.ADMIN))
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 전체 회원 조회
  @Get('/all')
  @ApiOperation({
    summary: '전체 회원 조회',
    description: '전체 회원 조회',
  })
  async findUser(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.userService.findAll(pageOptionsDto);
  }

  // 특정 회원 조회(id)
  @Get('/:id')
  @ApiOperation({
    summary: '특정 회원 조회',
    description: '특정 회원 조회(userId)',
  })
  @ApiParam({
    name: 'id',
    description: '회원 ID',
  })
  async findByUserId(@Param('id') id: string) {
    return await this.userService.findBy('id', id);
  }
}
