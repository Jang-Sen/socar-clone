import { User } from '../../user/entities/user.entity';

export interface RequestUserInterface extends Request {
  user: User;
}
