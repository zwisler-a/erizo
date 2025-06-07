import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableRenaming1749297119042 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE message_entity RENAME TO post_entity`);
    await queryRunner.query(`ALTER TABLE decryption_key_entity RENAME COLUMN messageId TO postId`);
    await queryRunner.query(`ALTER TABLE post_entity RENAME COLUMN chatId TO threadId`);
    await queryRunner.query(`ALTER TABLE thread_entity_participants_user_entity RENAME COLUMN chatEntityId TO threadEntityId`);
    await queryRunner.query(`ALTER TABLE connection_entity RENAME COLUMN chatId TO threadId`);
    await queryRunner.query(`ALTER TABLE chat_entity RENAME TO thread_entity`);
    await queryRunner.query(`ALTER TABLE chat_entity_participants_user_entity RENAME TO thread_entity_participants_user_entity`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE post_entity RENAME TO message_entity`);
    await queryRunner.query(`ALTER TABLE decryption_key_entity RENAME COLUMN postId TO messageId`);
    await queryRunner.query(`ALTER TABLE message_entity RENAME COLUMN threadId TO chatId`);
    await queryRunner.query(`ALTER TABLE chat_entity_participants_user_entity RENAME COLUMN threadEntityId TO chatEntityId`);
    await queryRunner.query(`ALTER TABLE connection_entity RENAME COLUMN threadId TO chatId`);
    await queryRunner.query(`ALTER TABLE thread_entity RENAME TO chat_entity`);
    await queryRunner.query(`ALTER TABLE thread_entity_participants_user_entity RENAME TO chat_entity_participants_user_entity`);
  }
}
