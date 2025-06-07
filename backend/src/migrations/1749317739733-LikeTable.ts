import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class LikeTable1749317739733 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
              name: 'like_entity',
              columns: [
                  {
                      name: 'userFingerprint',
                      type: 'varchar',
                      isPrimary: true,
                  },
                  {
                      name: 'postId',
                      type: 'int',
                      isPrimary: true,
                  },
              ],
          })
        );

        await queryRunner.createForeignKey(
          'like_entity',
          new TableForeignKey({
              columnNames: ['userFingerprint'],
              referencedTableName: 'user_entity',
              referencedColumnNames: ['fingerprint'],
              onDelete: 'CASCADE',
          })
        );

        await queryRunner.createForeignKey(
          'like_entity',
          new TableForeignKey({
              columnNames: ['postId'],
              referencedTableName: 'post_entity',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
          })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('like_entity');
    }
}
