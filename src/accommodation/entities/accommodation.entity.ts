import { Column, Entity } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { Type } from '@accommodation/entities/type.enum';

@Entity()
export class Accommodation extends Base {
  @Column()
  public name: string;

  @Column()
  public area: string;

  @Column()
  public type: Type;

  @Column()
  public reservatedAt: Date;

  @Column()
  public price: number;

  @Column()
  public personnel: number;

  @Column()
  public information: string;
}
