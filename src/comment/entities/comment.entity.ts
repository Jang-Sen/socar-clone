import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { User } from '@user/entities/user.entity';
import { Car } from '@car/entities/car.entity';
import { Accommodation } from '@accommodation/entities/accommodation.entity';

@Entity()
export class Comment extends Base {
  @Column()
  public contents: string;

  @Column()
  public rating: number;

  @ManyToOne(() => User, (user) => user.comments)
  public user: User;

  @ManyToOne(() => Car, (car) => car.comments)
  public car: Car;

  @ManyToOne(() => Accommodation, (accommodation) => accommodation.comments)
  public accommodation: Accommodation;
}
