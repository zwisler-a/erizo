import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CryptoService } from './service/crypto.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserController } from './controller/user.controller';
import { PersistenceModule } from './persistance/persistence.module';
import { PostController } from './controller/post.controller';
import { ChallengeValidationGuard } from './util/challenge-validation.guard';
import { ChallengeService } from './service/challenge.service';
import { ChallengesController } from './controller/authentication.controller';
import { PostService } from './service/post.service';
import { FileService } from './service/file.service';
import { ConnectionService } from './service/connection.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from './util/constants';
import { AuthGuard } from './util/auth.guard';
import { UserService } from './service/user.service';
import { ConnectionController } from './controller/connection.controller';
import { NotificationService } from './service/notification.service';
import { ThreadController } from './controller/thread.controller';
import { ThreadService } from './service/thread.service';
import { LoggerController } from './controller/logger.controller';
import {ShareController} from "./controller/share.controller";
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PersistenceModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [
    AppController,
    UserController,
    PostController,
    ChallengesController,
    ConnectionController,
    ThreadController,
    LoggerController,
    ShareController
  ],
  providers: [
    ThreadService,
    NotificationService,
    CryptoService,
    ConnectionService,
    ChallengeService,
    PostService,
    FileService,
    ChallengeValidationGuard,
    AuthGuard,
    UserService,
  ],
})
export class AppModule {}
