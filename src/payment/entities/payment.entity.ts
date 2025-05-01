import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '@root/profile/entities/profile.entity';

@Entity()
export class Payment {
  @ManyToOne(() => Profile, (profile: Profile) => profile.payments)
  public profile: Profile;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public cardCompany: string;

  @Column()
  public cardNumber: string;

  @Column()
  public cardCvc: number;

  @Column()
  public cardExpire: string;

  @Column({ nullable: true })
  public cardAlias?: string;

  @Column()
  public isMain: boolean;

  @CreateDateColumn()
  public createdAt: Date;
}
