import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '@comment/comment.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { UpdateCommentDto } from '@comment/dto/update-comment.dto';

@ApiTags('리뷰 API')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/car/:carId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '차량 리뷰 등록',
    description: `
    이용한 차량에 관한 리뷰를 작성합니다.
    `,
  })
  @ApiParam({
    name: 'carId',
    description: '차량 ID',
  })
  @ApiBody({
    description: '리뷰 생성 DTO',
    type: CreateCommentDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createCommentByCar(
    @Req() req: RequestUserInterface,
    @Param('carId') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.createCommentByCar(req.user, id, dto);
  }

  @Post('/accommodation/:accommodationId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '숙소 리뷰 등록',
    description: `
    이용한 숙소에 관한 리뷰를 작성합니다.
    `,
  })
  @ApiParam({
    name: 'accommodationId',
    description: '숙소 ID',
  })
  @ApiBody({
    description: '리뷰 생성 DTO',
    type: CreateCommentDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async createCommentByAccommodation(
    @Req() req: RequestUserInterface,
    @Param('accommodationId') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.createCommentByAccommodation(
      req.user,
      id,
      dto,
    );
  }

  @Get('/car/:carId')
  @ApiOperation({
    summary: '차량 리뷰 조회',
    description: `
    해당 차량에 대한 리뷰를 조회합니다.
    `,
  })
  @ApiParam({
    name: 'carId',
    description: '차량 ID',
  })
  async findCommentByCar(@Param('carId') id: string) {
    return await this.commentService.findCommentByCarId(id);
  }

  @Get('/accommodation/:accommodationId')
  @ApiOperation({
    summary: '숙소 리뷰 조회',
    description: `
    해당 숙소에 대한 리뷰를 조회합니다.
    `,
  })
  @ApiParam({
    name: 'accommodationId',
    description: '숙소 ID',
  })
  async findCommentByAccommodation(@Param('accommodationId') id: string) {
    return await this.commentService.findCommentByAccommodationId(id);
  }

  @Put('/:commentId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '리뷰 수정',
    description: `
    작성한 리뷰를 수정합니다.
      - 세부사항:
        - 해당 리뷰를 작성한 작성자만 수정 가능
    `,
  })
  @ApiParam({
    name: 'commentId',
    description: '리뷰 ID',
  })
  @ApiBody({
    description: '리뷰 수정 DTO',
    type: UpdateCommentDto,
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateComment(
    @Req() req: RequestUserInterface,
    @Param('commentId') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateCommentOnlySelf(req.user, id, dto);
  }

  @Delete('/:commentId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '리뷰 삭제',
    description: `
    작성한 리뷰를 삭제합니다.
      - 세부사항:
        - 해당 리뷰를 작성한 작성자만 삭제 가능
    `,
  })
  @ApiParam({
    name: 'commentId',
    description: '리뷰 ID',
  })
  async deleteComment(
    @Req() req: RequestUserInterface,
    @Param('commentId') id: string,
  ) {
    return await this.commentService.deleteCommentOnlySelf(req.user, id);
  }
}
