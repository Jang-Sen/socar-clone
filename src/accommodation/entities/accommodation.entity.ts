import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from '@common/entities/base.entity';
import { AccommodationType } from '@accommodation/entities/accommodation-type.enum';
import { Comment } from '@comment/entities/comment.entity';

@Entity()
export class Accommodation extends Base {
  @Column()
  public name: string;

  @Column()
  public area: string;

  @Column()
  public accommodationType: AccommodationType;

  @Column()
  public reservatedAt: Date;

  @Column()
  public price: number;

  @Column()
  public personnel: number;

  @Column()
  public information: string;

  @Column({ type: 'simple-array', nullable: true })
  public accommodationImgs?: string[];

  @OneToMany(() => Comment, (comment) => comment.accommodation)
  public comments: Comment[];
}
