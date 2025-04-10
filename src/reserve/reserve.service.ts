import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserve } from '@root/reserve/entities/reserve.entity';
import { LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { CarService } from '@car/car.service';
import { CreateReserveDto } from '@root/reserve/dto/create-reserve.dto';
import { User } from '@user/entities/user.entity';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';
import { UpdateReserveDto } from '@root/reserve/dto/update-reserve.dto';

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

  // 예약 취소
  async cancelReserve(user: User, reserveId: string): Promise<string> {
    const reserve = await this.repository.findOne({
      where: {
        user: { id: user.id },
        id: reserveId,
      },
    });

    if (!reserve) {
      throw new NotFoundException(
        '예약된 정보가 존재하지 않거나 권한이 없는 계정입니다.',
      );
    }

    reserve.status = ReserveStatus.CANCELED;

    await this.repository.save(reserve);

    return '예약이 취소되었습니다.';
  }

  // 예약 변경
  async patchReserve(
    user: User,
    reserveId: string,
    dto: UpdateReserveDto,
  ): Promise<string> {
    // 예약한 계정인지 확인
    const reserve = await this.repository.findOne({
      where: {
        user: { id: user.id },
        id: reserveId,
      },
      relations: {
        car: true,
      },
    });

    if (!reserve) {
      throw new NotFoundException(
        '예약된 정보가 존재하지 않거나 권한이 없는 계정입니다.',
      );
    }

    // 예약 상태 확인 (이용 완료 상태 or 취소 상태는 변경 불가)
    if (
      reserve.status === ReserveStatus.COMPLETED ||
      reserve.status === ReserveStatus.CANCELED
    ) {
      throw new BadRequestException(
        '이미 이용을 완료하셨거나 취소하신 예약에 대해서는 수정이 불가능합니다.',
      );
    }

    // 새로운 차량 변경 요청
    if (dto.carId && dto.carId !== reserve.car.id) {
      const newCar = await this.carService.findByCarId(dto.carId);

      // 차량 변경 시 예약된 상태인지 확인
      const newReserve = await this.repository.findOne({
        where: {
          id: Not(reserveId), // 현재 예약 제외
          car: { id: dto.carId },
          status: ReserveStatus.CONFIRMED,
          startTime: LessThanOrEqual(new Date(dto.endTime ?? reserve.endTime)),
          endTime: MoreThanOrEqual(
            new Date(dto.startTime ?? reserve.startTime),
          ),
        },
      });

      if (newReserve) {
        throw new BadRequestException(
          '변경하려는 차량이 이미 예약된 상태입니다.',
        );
      }

      reserve.car = newCar;
      reserve.status = ReserveStatus.PENDING;
    }

    reserve.startTime = dto.startTime
      ? new Date(dto.startTime)
      : reserve.startTime;
    reserve.endTime = dto.endTime ? new Date(dto.endTime) : reserve.endTime;
    reserve.status = dto.status ?? reserve.status;

    await this.repository.save(reserve);

    return '예약이 수정되었습니다.';
  }
}
