import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';

export class CreateReserveDto {
  @IsUUID()
  // @ApiProperty({ description: '회원 ID', example: 'uuid' })
  userId: string;

  @IsUUID()
  @ApiProperty({ description: '자동차 ID', example: 'uuid' })
  carId: string;

  @IsEnum(ReserveStatus)
  @ApiProperty({
    description: '예약 상태',
    enum: ReserveStatus,
    example: ReserveStatus.PENDING,
  })
  status: ReserveStatus;

  @IsDateString()
  @ApiProperty({ description: '예약 시작 시간' })
  startTime: string;

  @IsDateString()
  @ApiProperty({ description: '예약 종료 시간' })
  endTime: string;
}
