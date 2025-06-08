import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerController } from './feature/logging/logger.controller';
import { AuthenticationModule } from './feature/authentication/authentication.module';
import { ThreadModule } from './feature/thread/thread.module';
import { ConnectionModule } from './feature/connection/connection.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORMConfig } from './ORMConfig';
import { LoggingModule } from './feature/logging/logging.module';

@Module({
  imports: [
    AuthenticationModule,
    ThreadModule,
    ConnectionModule,
    LoggingModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    TypeOrmModule.forRoot(ORMConfig),
  ],
  controllers: [AppController, LoggerController],
  providers: [],
})
export class AppModule {}
