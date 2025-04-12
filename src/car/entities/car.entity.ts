import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { Scale } from '@car/entities/scale.enum';
import { Fuel } from '@car/entities/fuel.enum';
import { Comment } from '@comment/entities/comment.entity';
import { Reserve } from '@root/reserve/entities/reserve.entity';

@Index(['carName', 'grade', 'fuel', 'carYear'], { unique: true })
@Entity()
export class Car extends Base {
  @Column()
  public carName: string;

  @Column({ nullable: true })
  public grade?: string;

  @Column({
    type: 'enum',
    enum: Scale,
    default: Scale.DEFAULT,
    nullable: true,
  })
  public scale?: Scale;

  @Column({
    type: 'enum',
    enum: Fuel,
    default: Fuel.DEFAULT,
    nullable: true,
  })
  public fuel?: Fuel;

  @Column()
  public price: number;

  @Column({ nullable: true })
  public carYear?: number;

  @Column()
  public carNo: string;

  @Column()
  public transmission: string;

  @Column()
  public mileage: number;

  @Column()
  public displacement: number;

  @Column({ type: 'simple-array', nullable: true })
  public carImgs?: string[];

  @Column({ nullable: true })
  public memo?: string;

  @OneToMany(() => Comment, (comment: Comment) => comment.car)
  public comments: Comment[];

  @OneToMany(() => Reserve, (reserve: Reserve) => reserve.car)
  public reserves: Reserve[];
}
