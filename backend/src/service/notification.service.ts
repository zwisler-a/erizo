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

export interface NotificationPayload {
  type: NotificationType;
  thread_id?: string;
  post_id?: string;
  fingerprint?: string;
  timestamp?: string;
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
    data.timestamp = new Date().getTime().toString();
    const proms = actualUser.devices.map(async (device) => {
      this.logger.debug(`Sending message ${JSON.stringify(data)}`);
      await this.sendMessage(device.fcmToken, data);
    });
    await Promise.all(proms);
  }

  private removeEmpty = (obj: any) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = this.removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };

  private async sendMessage(token: string, data: NotificationPayload) {
    try {
      const message: Message = {
        token,
        notification: this.getNotificationFromType(data.type),
        data: this.removeEmpty(data),
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

  private getNotificationFromType(type: NotificationType): Partial<Notification> {
    if (type === NotificationType.NEW_POST) {
      return {
        title: ['You got mail', 'There is something for you', 'Come, have a look', 'I got something'][
          Math.floor(Math.random() * 4)
        ],
        body: [
          'There is a new post waiting for you',
          'There is something interesting for you',
          'I think you might want to have a look at whats new',
          'Something exciting is waiting for you',
        ][Math.floor(Math.random() * 4)],
      };
    }
    if (type === NotificationType.LIKE_POST) {
      return {
        title: ['Someone wants you', 'Someone thinks about you', 'Someone likes your post'][
          Math.floor(Math.random() * 3)
        ],
        body: [
          'I think there was someone very excited to see what you have done',
          'Someone liked what you posted. Really liked it!',
          'Your post got liked ;)',
        ][Math.floor(Math.random() * 3)],
      };
    }

    if (type === NotificationType.CONNECTION_REQUEST) {
      return {
        title: ['Someone wants to connect with you'][Math.floor(Math.random() * 1)],
        body: ['Someone send you a connection request'][Math.floor(Math.random() * 1)],
      };
    }
    if (type === NotificationType.CONNECTION_ADDED) {
      return {
        title: ['Your request got accepted'][Math.floor(Math.random() * 1)],
        body: ['Feel free to start sending them some treats'][Math.floor(Math.random() * 1)],
      };
    }

    return {
      title: 'Something happened!',
      body: 'Come and take a look, whats new in Erizo',
    };
  }
}
