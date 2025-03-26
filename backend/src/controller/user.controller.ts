import { Controller, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';
import { UserService } from '../service/user.service';
import { RegisterDeviceDto } from '../dto/user/register-device.dto';
import { NotificationService } from '../service/notification.service';

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
      if (added)
        await this.notificationService.notify(user, 'Device added!', 'Erizo just added a new device successfully :)');
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
