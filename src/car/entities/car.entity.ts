import { Column, Entity } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { Scale } from '@car/entities/scale.enum';
import { Fuel } from '@car/entities/fuel.enum';

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

  @Column({ type: 'simple-array', nullable: true })
  public carImgs?: string[];
}
