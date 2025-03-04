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
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { UpdateCommentDto } from '@comment/dto/update-comment.dto';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/car/:carId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '자동차 댓글 등록',
    description: '자동차에 관한 댓글 등록',
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
    summary: '숙소 댓글 등록',
    description: '숙소에 관한 댓글 등록',
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
    summary: '자동차 댓글 조회',
  })
  async findCommentByCar(@Param('carId') id: string) {
    return await this.commentService.findCommentByCarId(id);
  }

  @Get('/accommodation/:accommodationId')
  @ApiOperation({
    summary: '숙소 댓글 조회',
  })
  async findCommentByAccommodation(@Param('accommodationId') id: string) {
    return await this.commentService.findCommentByAccommodationId(id);
  }

  @Put('/:commentId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '댓글 수정',
    description: '본인이 작성한 댓글만 수정 가능',
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
    summary: '댓글 삭제',
    description: '본인이 작성한 댓글만 삭제 가능',
  })
  async deleteComment(
    @Req() req: RequestUserInterface,
    @Param('commentId') id: string,
  ) {
    return await this.commentService.deleteCommentOnlySelf(req.user, id);
  }
}
