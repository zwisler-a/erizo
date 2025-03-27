import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { messaging } from 'firebase-admin';
import { UserService } from './user.service';
import Message = messaging.Message;

export enum NotificationType {
  NEW_POST = 'NEW_POST',
  DEVICE_ADDED = 'DEVICE_ADDED',
  CONNECTION_ADDED = 'CONNECTION_ADDED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  LIKE_POST = 'LIKE_POST',
}

export interface NotificationPayload extends Record<string, string> {
  type: NotificationType;
}

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger(NotificationService.name);

  constructor(
    private userService: UserService,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
  ) {
    if (admin.apps.length === 0) {
      const serviceAccount = require(process.env.FCM_CRED_PATH ?? '../../erizo_fcm_cred.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  public async notify(user: Partial<UserEntity>, data: NotificationPayload) {
    const actualUser = await this.userRepository.findOneOrFail({ where: user, relations: { devices: true } });
    const proms = actualUser.devices.map(async (device) => {
      this.logger.debug(`Sending message ${JSON.stringify(data)}`);
      await this.sendMessage(device.fcmToken, data);
    });
    await Promise.all(proms);
  }

  private async sendMessage(token: string, data: NotificationPayload) {
    try {
      const message: Message = {
        token,
        data,
      };
      return await admin.messaging().send(message);
    } catch (error) {
      if ('messaging/registration-token-not-registered' === error.errorInfo.code) {
        this.logger.debug(`Removing stale token`);
        this.userService.removeDevice(token);
      } else {
        this.logger.error(error);
      }
    }
  }
}
