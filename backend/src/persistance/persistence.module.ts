import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { UserEntity } from './user.entity';
import { ConnectionEntity } from './connection.entity';
import { ChatEntity } from './chat.entity';
import { DecryptionKeyEntity } from './decryption-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity, ConnectionEntity, ChatEntity, DecryptionKeyEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([MessageEntity, UserEntity, ConnectionEntity, ChatEntity, DecryptionKeyEntity])],
})
export class PersistenceModule {}
