import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { CreateProfileDto } from '@root/profile/dto/create-profile.dto';
import { UpdateProfileDto } from '@root/profile/dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '유저에 대한 프로필 생성 API',
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
    summary: '유저에 대한 프로필 수정 API',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateProfile(
    @Req() req: RequestUserInterface,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.updateProfile(req.user, dto);
  }
}
