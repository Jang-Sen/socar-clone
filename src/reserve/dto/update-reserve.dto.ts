import { IsEnum, IsOptional } from 'class-validator';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';

export class UpdateReserveDto {
  @IsEnum(ReserveStatus)
  @IsOptional()
  status?: ReserveStatus;
}
