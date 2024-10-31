import { Base } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';
import { Fuel } from './fuel.enum';
import { Scale } from './scale.enum';

@Entity()
export class Car extends Base {
  @Column()
  public carName: string;

  @Column()
  public price: number;

  @Column({
    type: 'enum',
    enum: Scale,
    default: Scale.DEFAULT,
  })
  public scale: Scale;

  @Column({
    type: 'enum',
    enum: Fuel,
    default: Fuel.DEFAULT,
  })
  public fuel: Fuel;

  @Column({ nullable: true })
  public carImg?: string;
}
