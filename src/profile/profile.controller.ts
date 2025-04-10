import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { CreateProfileDto } from '@root/profile/dto/create-profile.dto';
import { UpdateProfileDto } from '@root/profile/dto/update-profile.dto';

@ApiTags('프로필 API')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '프로필 생성',
    description: `
    로그인한 회원의 프로필을 생성합니다.
      - 세부사항:
        - 로그인 되어있는 회원만 접근 가능
    `,
  })
  @ApiBody({
    description: '프로필 생성 DTO',
    type: CreateProfileDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createProfile(
    @Req() req: RequestUserInterface,
    @Body() dto: CreateProfileDto,
  ) {
    return await this.profileService.createProfile(req.user, dto);
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '프로필 수정',
    description: `
    회원의 프로필을 수정합니다.
      - 세부사항:
        - 로그인 되어있는 회원만 접근 가능
    `,
  })
  @ApiBody({
    description: '프로필 수정 DTO',
    type: UpdateProfileDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateProfile(
    @Req() req: RequestUserInterface,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.updateProfile(req.user, dto);
  }
}
