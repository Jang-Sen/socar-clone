import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from './entities/role.enum';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { RoleGuard } from '@auth/guards/role.guard';
import { PageOptionsDto } from '@common/dto/page-options.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 전체 회원 조회
  @Get('/all')
  @UseGuards(RoleGuard(Role.ADMIN))
  @ApiOperation({
    summary: '전체 회원 조회',
    description: '전체 회원 조회',
  })
  async findUser(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.userService.findAll(pageOptionsDto);
  }

  // 특정 회원 조회(id)
  @Get('/:id')
  @UseGuards(RoleGuard(Role.ADMIN))
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

  @Put()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('profileImg'))
  @ApiOperation({
    summary: '회원 프로필 수정',
  })
  @ApiBody({
    description: '프로필 이미지 변경',
    schema: {
      type: 'object',
      properties: {
        profileImg: {
          type: 'array',
          description: '프로필 이미지(이미지 파일 3개까지 가능)',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        address: {
          type: 'string',
          description: 'Address',
          example: '서울시 강동구',
        },
        phone: {
          type: 'string',
          description: 'Phone Number',
          example: '01022223333',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  async updateUserProfile(
    @Req() req: RequestUserInterface,
    @Body() dto?: UpdateUserDto,
    @UploadedFiles() img?: BufferedFile[],
  ) {
    return await this.userService.updateProfileByToken(req.user, dto, img);
  }
}
