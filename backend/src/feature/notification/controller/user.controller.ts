import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../authentication';
import { UserEntity } from '../../authentication/model/user.entity';
import { UserService } from '../../authentication';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { NotificationService, NotificationType } from '../service/notification.service';
import { DeviceEntity } from '../../authentication/model/device.entity';

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
      this.logger.debug(`Registering device for user ${user.fingerprint}`);
      if (added) await this.notificationService.notify(user, { type: NotificationType.DEVICE_ADDED });
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiResponse({ type: DeviceEntity, isArray: true })
  @Get('device')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'getRegisterDevices' })
  async getDevices(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      this.logger.debug(`Retrieving ${user.fingerprint}`);
      return await this.userService.getDevices(user);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiQuery({ name: 'token', type: 'string' })
  @Delete('device')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteDevice' })
  async deleteDevice(@Request() req: any, @Query('token') token: string) {
    try {
      const user = req.user as UserEntity;
      this.logger.debug(`Deleting device for ${user.fingerprint}`);
      return await this.userService.removeDeviceForUser(user, token);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
