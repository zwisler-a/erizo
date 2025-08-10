import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostType1754494286877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post_entity"
        ADD "type" VARCHAR NOT NULL DEFAULT 'image'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post_entity"
      DROP
      COLUMN "type"
    `);
  }
}
