import { PartialType } from '@nestjs/swagger';
import { CreateAccommodationDto } from '@accommodation/dto/create-accommodation.dto';

export class UpdateAccommodationDto extends PartialType(
  CreateAccommodationDto,
) {}
