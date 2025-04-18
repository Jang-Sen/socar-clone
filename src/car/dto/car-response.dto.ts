import { ApiProperty } from '@nestjs/swagger';
import { CreateCarDto } from '@car/dto/create-car.dto';

class Meta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  hasBeforePage: boolean;

  @ApiProperty()
  hasNestPage: boolean;
}

class FindCarsBody {
  @ApiProperty({ type: [CreateCarDto] })
  data: CreateCarDto[];

  @ApiProperty({ type: Meta })
  meta: Meta;
}

export class FindCarsDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: FindCarsBody })
  body: FindCarsBody;
}
