import { ConnectionOptions } from 'typeorm';
import { PostEntity } from './persistance/post.entity';
import { UserEntity } from './persistance/user.entity';
import { ConnectionEntity } from './persistance/connection.entity';
import { ThreadEntity } from './persistance/thread.entity';
import { DecryptionKeyEntity } from './persistance/decryption-key.entity';
import { DeviceEntity } from './persistance/device.entity';
import { LikeEntity } from './persistance/like.entity';

export const ORMConfig: ConnectionOptions = {
  type: 'sqlite',
  database: 'db/db.sql',
  entities: [PostEntity, UserEntity, ConnectionEntity, ThreadEntity, DecryptionKeyEntity, DeviceEntity, LikeEntity],
  synchronize: false,
  migrationsRun: true,

  logging: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};
