import { Base } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';
import { Provider } from './provider.enum';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public password?: string;

  @Column()
  public username: string;

  @Column({ nullable: true })
  public phone?: number;

  @Column({ nullable: true })
  public address?: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  public provider?: Provider;

  @Column({ nullable: true })
  public profileImg?: string;
}
