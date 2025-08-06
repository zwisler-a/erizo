import { Module } from '@nestjs/common';
import { NotificationService } from './service/notification.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserController } from './controller/user.controller';

@Module({
  imports: [AuthenticationModule],
  controllers: [UserController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
