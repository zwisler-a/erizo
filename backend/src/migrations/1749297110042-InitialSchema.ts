import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1749297110042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS user_entity
                             (
                                 fingerprint varchar PRIMARY KEY NOT NULL,
                                 public_key  varchar             NOT NULL
                             )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS chat_entity (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name varchar,
      ownerFingerprint varchar,
      FOREIGN KEY (ownerFingerprint) REFERENCES user_entity(fingerprint)
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS chat_entity_participants_user_entity (
      chatEntityId integer NOT NULL,
      userEntityFingerprint varchar NOT NULL,
      PRIMARY KEY (chatEntityId, userEntityFingerprint),
      FOREIGN KEY (chatEntityId) REFERENCES chat_entity(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (userEntityFingerprint) REFERENCES user_entity(fingerprint) ON DELETE CASCADE ON UPDATE CASCADE
    )`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_98c0393b314f2a5352a4578a49 ON chat_entity_participants_user_entity (chatEntityId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_a862b6eba451a3093f7928c7b0 ON chat_entity_participants_user_entity (userEntityFingerprint)`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS connection_entity (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      state varchar NOT NULL DEFAULT 'PENDING',
      ownerFingerprint varchar,
      connectedWithFingerprint varchar,
      chatId integer,
      alias varchar,
      FOREIGN KEY (ownerFingerprint) REFERENCES user_entity(fingerprint),
      FOREIGN KEY (connectedWithFingerprint) REFERENCES user_entity(fingerprint),
      FOREIGN KEY (chatId) REFERENCES chat_entity(id) ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS device_entity (
      fcmToken varchar PRIMARY KEY NOT NULL,
      userFingerprint varchar,
      FOREIGN KEY (userFingerprint) REFERENCES user_entity(fingerprint)
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS message_entity (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      sender_fingerprint varchar NOT NULL,
      message varchar NOT NULL,
      file_path varchar NOT NULL,
      iv varchar NOT NULL,
      created_at integer NOT NULL DEFAULT 1745775954730,
      days_to_live integer,
      chatId integer,
      nsfw boolean NOT NULL DEFAULT 0,
      FOREIGN KEY (chatId) REFERENCES chat_entity(id)
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS decryption_key_entity (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      recipient_fingerprint varchar NOT NULL,
      encrypted_key varchar NOT NULL,
      messageId integer,
      FOREIGN KEY (messageId) REFERENCES message_entity(id)
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS decryption_key_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS message_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS device_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS connection_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS chat_entity_participants_user_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS chat_entity`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_entity`);
  }
}
