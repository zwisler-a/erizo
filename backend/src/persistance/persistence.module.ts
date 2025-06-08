import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';
import { ConnectionEntity } from './connection.entity';
import { ThreadEntity } from './thread.entity';
import { PostDecryptionKeyEntity } from './post-decryption-key.entity';
import { DeviceEntity } from './device.entity';
import { ORMConfig } from '../ORMConfig';
import { LikeEntity } from './like.entity';
import { CommentEntity } from './comment.entity';
import { CommentDecryptionKeyEntity } from './comment-decryption-key.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(ORMConfig),
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      ConnectionEntity,
      ThreadEntity,
      PostDecryptionKeyEntity,
      DeviceEntity,
      LikeEntity,
      CommentEntity,
      CommentDecryptionKeyEntity,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      ConnectionEntity,
      ThreadEntity,
      PostDecryptionKeyEntity,
      DeviceEntity,
      LikeEntity,
      CommentEntity,
      CommentDecryptionKeyEntity,
    ]),
  ],
})
export class PersistenceModule {}
