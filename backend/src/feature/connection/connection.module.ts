import { Module } from '@nestjs/common';
import { ConnectionController } from './controller/connection.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ConnectionService } from './service/connection.service';
import { ConnectionEntity } from './model/connection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadModule } from '../thread/thread.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthenticationModule, TypeOrmModule.forFeature([ConnectionEntity]), ThreadModule, NotificationModule],
  controllers: [ConnectionController],
  providers: [ConnectionService],
  exports: [],
})
export class ConnectionModule {}
