import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller/authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './service/user.service';
import { UserEntity } from './model/user.entity';
import { DeviceEntity } from './model/device.entity';
import { ChallengeService } from './service/challenge.service';
import { CryptoService } from './service/crypto.service';
import { AuthGuard } from './guard/auth.guard';
import { ChallengeValidationGuard } from './guard/challenge-validation.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from '../../constants';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DeviceEntity]),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthenticationController, UserController],
  providers: [UserService, ChallengeService, CryptoService, ChallengeValidationGuard, AuthGuard],
  exports: [UserService, AuthGuard],
})
export class AuthenticationModule {}
