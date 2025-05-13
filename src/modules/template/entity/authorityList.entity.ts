import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

@Entity()
@Unique(['city'])
export class AuthorityList extends BaseEntity {
  @Column({ type: 'enum', enum: DOCUMENT_TYPE })
  document: string;

  @Column()
  city: string;

  @Column('text')
  authoritiesUk: string;

  @Column('text')
  authoritiesEn: string;
}
