import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../authentication/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { messaging } from 'firebase-admin';
import { UserService } from '../../authentication/service/user.service';
import Message = messaging.Message;

export enum NotificationType {
  NEW_POST = 'NEW_POST',
  DEVICE_ADDED = 'DEVICE_ADDED',
  CONNECTION_ADDED = 'CONNECTION_ADDED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  LIKE_POST = 'LIKE_POST',
  NEW_COMMENT = 'NEW_COMMENT',
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

  constructor(private userService: UserService) {
    if (admin.apps.length === 0) {
      const serviceAccount = require(process.env.FCM_CRED_PATH ?? '../../../../erizo_fcm_cred.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  public async notify(user: Partial<UserEntity>, data: NotificationPayload) {
    const devices = await this.userService.getDevices(user);
    data.timestamp = new Date().getTime().toString();
    const proms = devices.map(async (device) => {
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
        title: 'You got mail',
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
        title: 'Someone likes your post',
        body: [
          'I think there was someone very excited to see what you have done',
          'Someone liked what you posted.',
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
    if (type === NotificationType.NEW_COMMENT) {
      return {
        title: ['Someone has left you a comment'][Math.floor(Math.random() * 1)],
        body: ['Want to have a look?'][Math.floor(Math.random() * 1)],
      };
    }

    return {
      title: 'Something happened!',
      body: 'Come and take a look, whats new in Erizo',
    };
  }
}
