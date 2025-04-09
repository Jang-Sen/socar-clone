import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { ReserveStatus } from '@root/reserve/entities/reserveStatus.enum';
import { User } from '@user/entities/user.entity';
import { Car } from '@car/entities/car.entity';

@Entity()
export class Reserve extends Base {
  @ManyToOne(() => User, (user) => user.reserves)
  public user: User;

  @ManyToOne(() => Car, (car) => car.reserves)
  public car: Car;

  @Column({
    type: 'enum',
    enum: ReserveStatus,
    default: ReserveStatus.PENDING,
  })
  public status: ReserveStatus;

  @Column({ type: 'timestamp' })
  public startTime: Date;

  @Column({ type: 'timestamp' })
  public endTime: Date;
}
