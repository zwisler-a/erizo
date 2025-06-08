import { Controller, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { UserEntity } from '../model/user.entity';
import { UserService } from '../service/user.service';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { NotificationService, NotificationType } from '../../notification/service/notification.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  @ApiBody({ type: RegisterDeviceDto })
  @Post('device')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'registerDevice' })
  async createDevice(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      const body = req.body as RegisterDeviceDto;
      const added = await this.userService.registerDevice(user, body.fcmToken);
      this.logger.debug(`Registering device for user ${user.fingerprint}`)
      if (added) await this.notificationService.notify(user, { type: NotificationType.DEVICE_ADDED });
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
