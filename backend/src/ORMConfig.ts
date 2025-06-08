import { ConnectionOptions } from 'typeorm';
import { PostEntity } from './persistance/post.entity';
import { UserEntity } from './persistance/user.entity';
import { ConnectionEntity } from './persistance/connection.entity';
import { ThreadEntity } from './persistance/thread.entity';
import { PostDecryptionKeyEntity } from './persistance/post-decryption-key.entity';
import { DeviceEntity } from './persistance/device.entity';
import { LikeEntity } from './persistance/like.entity';
import { CommentEntity } from './persistance/comment.entity';
import { CommentDecryptionKeyEntity } from './persistance/comment-decryption-key.entity';

export const ORMConfig: ConnectionOptions = {
  type: 'sqlite',
  database: 'db/db.sql',
  entities: [
    PostEntity,
    UserEntity,
    ConnectionEntity,
    ThreadEntity,
    PostDecryptionKeyEntity,
    DeviceEntity,
    LikeEntity,
    CommentEntity,
    CommentDecryptionKeyEntity,
  ],
  logging: true,
  synchronize: true,
  migrationsRun: false,

  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};
