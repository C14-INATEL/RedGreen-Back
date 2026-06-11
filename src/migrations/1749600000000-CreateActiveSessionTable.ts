import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateActiveSessionTable1749600000000 implements MigrationInterface {
  name = 'CreateActiveSessionTable1749600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ActiveSession_GameType_enum" AS ENUM('Slot', 'Gambit')`
    );

    await queryRunner.createTable(
      new Table({
        name: 'ActiveSession',
        columns: [
          {
            name: 'ActiveSessionId',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'UserId',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'GameType',
            type: 'enum',
            enumName: 'ActiveSession_GameType_enum',
            isNullable: false,
          },
          {
            name: 'ReferenceId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'CreatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'ActiveSession',
      new TableForeignKey({
        name: 'FK_ActiveSession_UserId',
        columnNames: ['UserId'],
        referencedTableName: 'User',
        referencedColumnNames: ['UserId'],
        onDelete: 'RESTRICT',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'ActiveSession',
      'FK_ActiveSession_UserId'
    );
    await queryRunner.dropTable('ActiveSession');
    await queryRunner.query(`DROP TYPE "public"."ActiveSession_GameType_enum"`);
  }
}
