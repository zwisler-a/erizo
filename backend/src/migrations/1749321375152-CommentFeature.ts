import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CommentFeature1749321375152 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE post_decryption_key_entity RENAME COLUMN messageId TO postId`);
    // await queryRunner.query(`ALTER TABLE decryption_key_entity RENAME TO post_decryption_key_entity`);

    await queryRunner.createTable(
      new Table({
        name: 'comment_entity',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'content',
            type: 'varchar',
          },
          {
            name: 'iv',
            type: 'varchar',
          },
          {
            name: 'authorFingerprint',
            type: 'varchar',
          },
          {
            name: 'postId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'comment_entity',
      new TableForeignKey({
        columnNames: ['authorId'],
        referencedColumnNames: ['fingerprint'],
        referencedTableName: 'user_entity',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'comment_entity',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'post_entity',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'comment_decryption_key_entity',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'commentId',
            type: 'int',
          },
          {
            name: 'recipient_fingerprint',
            type: 'varchar',
          },
          {
            name: 'encrypted_key',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'comment_decryption_key_entity',
      new TableForeignKey({
        columnNames: ['commentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'comment_entity',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
