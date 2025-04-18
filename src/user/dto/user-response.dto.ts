import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@user/entities/provider.enum';
import { Role } from '@user/entities/role.enum';
import { Term } from '@term/entities/term.entity';
import { CreateCommentDto } from '@comment/dto/create-comment.dto';
import { CreateTermDto } from '@term/dto/create-term.dto';
import { CreateReserveDto } from '@root/reserve/dto/create-reserve.dto';
import { Reserve } from '@root/reserve/entities/reserve.entity';
import { Comment } from '@comment/entities/comment.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';

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

class User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deleteAt: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ type: [String] })
  profileImg: string[];

  @ApiProperty({ enum: Provider })
  provider: Provider;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ type: [CreateCommentDto] })
  comments: Comment[];

  @ApiProperty({ type: CreateTermDto })
  term: Term;

  @ApiProperty({ type: [CreateReserveDto] })
  reserves: Reserve[];
}

class FindAllUsersBodyDto {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ type: Meta })
  meta: Meta;
}

export class FindAllUsersResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: FindAllUsersBodyDto })
  body: FindAllUsersBodyDto;
}

export class CreateUserResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: CreateUserDto })
  user: User;
}
