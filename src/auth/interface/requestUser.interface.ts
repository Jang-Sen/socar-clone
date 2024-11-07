import { User } from '../../user/entities/user.entity';
import { Request } from 'express';

export interface RequestUserInterface extends Request {
  user: User;
}
