import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@user/entities/user.entity';

@Entity()
export class Term {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ default: false })
  public agreeOfTerm: boolean;

  @Column({ default: false })
  public agreeFourteen: boolean;

  @Column({ default: false })
  public agreeOfService: boolean;

  @Column({ default: false })
  public agreeOfEvent?: boolean;

  @OneToOne(() => User, (user: User) => user.term)
  public user: User;
}
