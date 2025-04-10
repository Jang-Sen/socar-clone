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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from './entities/role.enum';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { BufferedFile } from '@minio-client/interface/file.model';
import { RoleGuard } from '@auth/guards/role.guard';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { FindAllUsersResponseDto } from '@user/dto/user-response.dto';

@ApiTags('유저 API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 전체 회원 조회
  @Get('/all')
  @UseGuards(RoleGuard(Role.ADMIN))
  @ApiOperation({
    summary: '전체 회원 조회',
    description: `
    DB에 저장된 회원 목록을 조회합니다.
     - 세부사항:
      - ${Role.ADMIN}만 접근 가능
      - 페이지네이션(Pagination) 지원 (예: 페이지당 10건)
      - 이름으로 필터링할 수 있는 검색 기능 제공
      - 정렬 기능 제공
    `,
  })
  @ApiOkResponse({
    description: '조회 성공',
    type: FindAllUsersResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: `${Role.ADMIN}만 접근 가능`,
  })
  async findUser(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.userService.findAll(pageOptionsDto);
  }

  // 특정 회원 조회(id)
  @Get('/:id')
  @UseGuards(RoleGuard(Role.ADMIN))
  @ApiOperation({
    summary: '특정 회원 조회',
    description: `
    DB에 저장된 회원 중 특정 회원의 ID를 이용하여 조회합니다.
      - 세부사항:
        - ${Role.ADMIN}만 접근 가능
    `,
  })
  @ApiParam({
    name: 'id',
    description: '회원 ID',
  })
  @ApiUnauthorizedResponse({
    description: `${Role.ADMIN}만 접근 가능`,
  })
  async findByUserId(@Param('id') id: string) {
    return await this.userService.findBy('id', id);
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('profileImg'))
  @ApiOperation({
    summary: '회원 프로필 이미지 수정',
    description: `
    회원의 프로필 사진을 수정합니다.
      - 세부사항:
        - 프로필 이미지 3개까지 등록 가능
        - 프로필 이미지 데이터는 MinIO에 저장 후 관리
    `,
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
