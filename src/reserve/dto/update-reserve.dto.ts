import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReserveDto {
  @IsUUID()
  @ApiProperty({
    description: '자동차 ID',
    example: '00b34f84-3e32-4cca-a758-97904e9004d2',
  })
  carId: string;

  @IsEnum(ReserveStatus)
  @ApiProperty({
    description: '예약 상태',
    enum: ReserveStatus,
    example: ReserveStatus.CONFIRMED,
  })
  status: ReserveStatus;

  @IsDateString()
  @ApiProperty({
    description: '예약 시작 시간',
    example: '2024-04-01 10:00:00',
  })
  startTime: string;

  @IsDateString()
  @ApiProperty({
    description: '예약 종료 시간',
    example: '2024-04-01 12:00:00',
  })
  endTime: string;
}
