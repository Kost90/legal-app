import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Document } from 'src/modules/documents/entity/document.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => Document, (document) => document.user, {
    cascade: true,
  })
  documents: Document[];
}
