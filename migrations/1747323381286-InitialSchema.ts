import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

// Переименовываем класс, чтобы отразить, что это начальная схема
export class InitialSchema1747323381286 implements MigrationInterface {
  name = 'InitialSchema1747323381286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Создание таблицы 'users' ---
    // Создаем ее одной из первых, так как на нее ссылается таблица 'documents'
    await queryRunner.createTable(
      new Table({
        name: 'user', // Имя таблицы будет 'user' по умолчанию
        columns: [
          // Предполагаемые колонки из BaseEntity
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP', isNullable: false },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },

          // Колонки из User Entity
          { name: 'firstName', type: 'varchar', isNullable: false },
          { name: 'lastName', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'phone', type: 'varchar', isNullable: false },
          { name: 'passwordHash', type: 'varchar', isNullable: false },
          { name: 'isEmailVerified', type: 'boolean', default: false, isNullable: false },
        ],
      }),
      true, // true, если не существует
    );

    // --- Создание таблицы 'authority_list' ---
    await queryRunner.createTable(
      new Table({
        name: 'authority_list',
        columns: [
          // Предполагаемые колонки из BaseEntity
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP', isNullable: false },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },

          // Колонки из AuthorityList Entity
          // Для enum в PostgreSQL лучше всего подходит varchar с CHECK constraint или нативный тип enum
          { name: 'document', type: 'varchar', isNullable: false },
          { name: 'city', type: 'varchar', isNullable: false },
          { name: 'authoritiesUk', type: 'text', isNullable: false },
          { name: 'authoritiesEn', type: 'text', isNullable: false },
        ],
        uniques: [{ columnNames: ['city'] }], // Уникальное ограничение
      }),
      true,
    );

    // --- Создание таблицы 'document_generation_logs' ---
    // Эта таблица не наследует id от BaseEntity, у нее свой PrimaryColumn
    await queryRunner.createTable(
      new Table({
        name: 'document_generation_logs',
        columns: [
          // Колонки из DocumentGenerationLog Entity
          { name: 'email', type: 'varchar', length: '255', isPrimary: true, isNullable: false },
          { name: 'lastFreeGenerationAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'isVerified', type: 'boolean', default: false, isNullable: false },
          { name: 'verificationToken', type: 'varchar', isUnique: true, isNullable: true },
          { name: 'verificationTokenExpiresAt', type: 'timestamp with time zone', isNullable: true },

          // Добавляем createdAt и updatedAt, так как они были в вашей BaseEntity
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP', isNullable: false },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // --- Создание таблицы 'documents' ---
    // Создаем последней, так как она зависит от 'users'
    await queryRunner.createTable(
      new Table({
        name: 'document',
        columns: [
          // Предполагаемые колонки из BaseEntity
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP', isNullable: false },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },

          // Колонки из Document Entity
          { name: 'fileKey', type: 'varchar', isNullable: false },
          { name: 'isPaid', type: 'boolean', default: false },
          { name: 'expiredAt', type: 'varchar', isNullable: true },
          { name: 'lang', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', isNullable: false },

          // Колонка для внешнего ключа
          { name: 'userId', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    // --- Создание внешнего ключа для 'documents' ---
    await queryRunner.createForeignKey(
      'document', // Таблица, в которую добавляем ключ
      new TableForeignKey({
        columnNames: ['userId'], // Колонка в 'documents'
        referencedColumnNames: ['id'], // Колонка в 'user'
        referencedTableName: 'user', // Таблица, на которую ссылаемся
        onDelete: 'CASCADE', // Правило при удалении пользователя
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Выполняем удаление в обратном порядке, чтобы избежать ошибок с foreign key
    await queryRunner.dropForeignKey('document', 'FK_user_documents'); // Имя ключа может отличаться, лучше указывать явно
    await queryRunner.dropTable('document');
    await queryRunner.dropTable('document_generation_logs');
    await queryRunner.dropTable('authority_list');
    await queryRunner.dropTable('user');
  }
}
