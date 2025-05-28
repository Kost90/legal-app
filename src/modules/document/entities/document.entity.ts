import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Document extends BaseEntity {
  @Column({ nullable: false })
  fileKey: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  expiredAt: string;

  @Column()
  lang: string;

  @Column()
  type: string;

  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
