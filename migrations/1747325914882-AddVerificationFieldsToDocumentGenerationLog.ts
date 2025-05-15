import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVerificationFieldsToDocumentGenerationLog1747325914882 implements MigrationInterface {
  name = 'AddVerificationFieldsToDocumentGenerationLog1747325914882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('document_generation_logs', [
      new TableColumn({
        name: 'isVerified',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'verificationToken',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
      new TableColumn({
        name: 'verificationTokenExpiresAt',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    ]);

    await queryRunner.changeColumn(
      'document_generation_logs',
      'lastFreeGenerationAt',
      new TableColumn({
        name: 'lastFreeGenerationAt',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('document_generation_logs', [
      'isVerified',
      'verificationToken',
      'verificationTokenExpiresAt',
    ]);

    await queryRunner.changeColumn(
      'document_generation_logs',
      'lastFreeGenerationAt',
      new TableColumn({
        name: 'lastFreeGenerationAt',
        type: 'timestamp with time zone',
        isNullable: false,
      }),
    );
  }
}
