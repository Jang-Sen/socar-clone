import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { Gender } from '@root/profile/entities/gender.enum';
import { Grade } from '@root/profile/entities/grade.enum';

@Entity()
export class Profile {
  @OneToOne(() => User, (user: User) => user.profile)
  public user: User;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: true })
  public address?: string;

  @Column({ type: 'date' })
  public birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.DEFAULT,
  })
  public gender: Gender;

  @Column({
    type: 'enum',
    enum: Grade,
    default: Grade.BRONZE,
  })
  public grade: Grade;
}
