import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserve } from '@root/reserve/entities/reserve.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CarService } from '@car/car.service';
import { CreateReserveDto } from '@root/reserve/dto/create-reserve.dto';
import { User } from '@user/entities/user.entity';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';

@Injectable()
export class ReserveService {
  constructor(
    @InjectRepository(Reserve)
    private readonly repository: Repository<Reserve>,
    private readonly carService: CarService,
  ) {}

  // 예약 생성
  async createReserve(user: User, dto: CreateReserveDto): Promise<Reserve> {
    // 자동차 정보 찾기
    const car = await this.carService.findByCarId(dto.carId);

    // 이미 예약된 상태 확인
    const isReserved = await this.repository.findOne({
      where: {
        car: { id: dto.carId },
        status: ReserveStatus.CONFIRMED,
        startTime: LessThanOrEqual(new Date(dto.endTime)),
        endTime: MoreThanOrEqual(new Date(dto.startTime)),
      },
    });

    // 예약되어 있을 시 에러
    if (isReserved) {
      throw new BadRequestException('이미 예약된 시간입니다.');
    }

    // 예약중인 상태가 아닐 시 예약 생성
    const reserve = this.repository.create({
      user,
      car,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      status: ReserveStatus.CONFIRMED,
    });

    return await this.repository.save(reserve);
  }
}
