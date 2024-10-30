import { Base } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Car extends Base {
  @Column()
  public carName: string;

  @Column()
  public price: number;

  @Column()
  public scale: string;

  @Column()
  public fuel: string;

  @Column({ nullable: true })
  public carImg?: string;
}
