import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Document } from 'src/modules/documents/entity/document.entity';

@Entity()
export class DocumentType extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Document, (document) => document.documentType)
  documents: Document[];
}
