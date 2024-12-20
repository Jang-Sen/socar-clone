import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '@comment/entities/comment.entity';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';
import { CarService } from '@car/car.service';
import { AccommodationService } from '@accommodation/accommodation.service';
import { UpdateCommentDto } from '@comment/dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly repository: Repository<Comment>,
    private readonly carService: CarService,
    private readonly accommodationService: AccommodationService,
  ) {}

  // 생성(carID)
  async createCommentByCar(
    user: User,
    carId: string,
    commentDto: CreateCommentDto,
  ) {
    const car = await this.carService.findByCarId(carId);

    const comment = this.repository.create({
      user,
      car,
      ...commentDto,
    });

    await this.repository.save(comment);

    return comment;
  }

  // 생성(accommodationID)
  async createCommentByAccommodation(
    user: User,
    accommodationId: string,
    commentDto: CreateCommentDto,
  ) {
    const accommodation =
      await this.accommodationService.findById(accommodationId);

    const comment = this.repository.create({
      user,
      accommodation,
      ...commentDto,
    });

    await this.repository.save(comment);

    return comment;
  }

  // 자동차에 관한 댓글 조회
  async findCommentByCarId(carId: string) {
    const car = await this.carService.findByCarId(carId);

    const comments = await this.repository.find({
      where: {
        car: {
          id: car.id,
        },
      },
      relations: {
        user: true,
        car: true,
      },
    });

    if (!comments) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comments;
  }

  // 숙소에 관한 댓글 조회
  async findCommentByAccommodationId(accommodationId: string) {
    const accommodation =
      await this.accommodationService.findById(accommodationId);

    const comments = await this.repository.find({
      where: {
        accommodation: {
          id: accommodation.id,
        },
      },
      relations: {
        user: true,
        accommodation: true,
      },
    });

    if (!comments) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comments;
  }

  // 댓글 수정
  async updateCommentOnlySelf(
    user: User,
    commentId: string,
    commentDto: UpdateCommentDto,
  ): Promise<string> {
    const comment = await this.repository.findOne({
      where: {
        id: commentId,
      },
      relations: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.id !== user.id) {
      throw new ForbiddenException('본인이 작성한 댓글만 수정 가능합니다.');
    }

    Object.assign(comment, commentDto);
    await this.repository.save(comment);

    return '수정 완료';
  }
}
