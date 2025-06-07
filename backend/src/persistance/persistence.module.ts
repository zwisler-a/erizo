import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';
import { ConnectionEntity } from './connection.entity';
import { ThreadEntity } from './thread.entity';
import { DecryptionKeyEntity } from './decryption-key.entity';
import { DeviceEntity } from './device.entity';
import { ORMConfig } from '../ORMConfig';


@Module({
  imports: [
    TypeOrmModule.forRoot(ORMConfig),
    TypeOrmModule.forFeature([
      PostEntity,
      UserEntity,
      ConnectionEntity,
      ThreadEntity,
      DecryptionKeyEntity,
      DeviceEntity,
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
      DecryptionKeyEntity,
      DeviceEntity,
    ]),
  ],
})
export class PersistenceModule {}
