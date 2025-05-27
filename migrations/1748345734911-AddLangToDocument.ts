import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLangToDocument1748345734911 implements MigrationInterface {
  name = 'AddLangToDocument1748345734911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "document" ADD "lang" character varying NOT NULL DEFAULT 'ru'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "document" DROP COLUMN "lang"
    `);
  }
}
