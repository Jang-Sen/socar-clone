import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { Gender } from '@root/profile/entities/gender.enum';
import { Grade } from '@root/profile/entities/grade.enum';
import { Payment } from '@root/payment/entities/payment.entity';
import { Base } from '@common/entities/base.entity';

@Entity()
export class Profile extends Base {
  @OneToOne(() => User, (user: User) => user.profile)
  public user: User;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: true })
  public address?: string;

  @Column({ type: 'date', default: null })
  public birth?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.DEFAULT,
  })
  public gender?: Gender;

  @Column({
    type: 'enum',
    enum: Grade,
    default: Grade.BRONZE,
    nullable: true,
  })
  public grade?: Grade;

  @OneToMany(() => Payment, (payment: Payment) => payment.profile)
  public payments: Payment[];
}
