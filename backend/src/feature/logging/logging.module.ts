import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [AuthenticationModule],
  controllers: [LoggerController],
  providers: [],
})
export class LoggingModule {}
