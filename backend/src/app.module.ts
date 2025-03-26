import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CryptoService } from './service/crypto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './persistance/message.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserController } from './controller/user.controller';
import { UserEntity } from './persistance/user.entity';
import { PersistenceModule } from './persistance/persistence.module';
import { MessageController } from './controller/message.controller';
import { ChallengeValidationGuard } from './util/challenge-validation.guard';
import { ChallengeService } from './service/challenge.service';
import { ChallengesController } from './controller/authentication.controller';
import { MessageService } from './service/message.service';
import { FileService } from './service/file.service';
import { ConnectionService } from './service/connection.service';
import { ConnectionEntity } from './persistance/connection.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from './util/constants';
import { ChatEntity } from './persistance/chat.entity';
import { DecryptionKeyEntity } from './persistance/decryption-key.entity';
import { AuthGuard } from './util/auth.guard';
import { UserService } from './service/user.service';
import { ConnectionController } from './controller/connection.controller';
import { DeviceEntity } from './persistance/device.entity';
import { MessagingService } from './service/messaging.service';
import { NotificationService } from './service/notification.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/db.sql',
      synchronize: true,
      entities: [MessageEntity, UserEntity, ConnectionEntity, ChatEntity, DecryptionKeyEntity, DeviceEntity],
    }),
    PersistenceModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, UserController, MessageController, ChallengesController, ConnectionController],
  providers: [
    NotificationService,
    MessagingService,
    CryptoService,
    ConnectionService,
    ChallengeService,
    MessageService,
    FileService,
    ChallengeValidationGuard,
    AuthGuard,
    UserService,
  ],
})
export class AppModule {}
