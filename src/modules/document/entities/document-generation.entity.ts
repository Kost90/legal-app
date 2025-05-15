import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('document_generation_logs')
export class DocumentGenerationLog extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastFreeGenerationAt: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  verificationToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verificationTokenExpiresAt: Date | null;
}
