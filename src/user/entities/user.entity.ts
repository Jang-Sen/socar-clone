import { Base } from '../../common/base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { Provider } from './provider.enum';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import * as gravatar from 'gravatar';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  @Exclude()
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
  public provider: Provider;

  @Column({ nullable: true })
  public profileImg?: string;

  @BeforeInsert()
  async beforeFunction() {
    try {
      if (this.provider !== Provider.LOCAL) {
        return;
      } else {
        // 패스워드 암호화
        const genValue = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, genValue);

        // 프로필 사진 자동생성
        this.profileImg = gravatar.url(this.email, {
          s: '200',
          r: 'pg',
          d: 'mm',
          protocol: 'https',
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
