import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '@comment/entities/comment.entity';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';
import { CarService } from '@car/car.service';
import { AccommodationService } from '@accommodation/accommodation.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly repository: Repository<Comment>,
    private readonly carService: CarService,
    private readonly accommodationService: AccommodationService,
  ) {}

  // 생성(carId)
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
}
