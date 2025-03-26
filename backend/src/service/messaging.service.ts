import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class MessagingService {
  constructor() {
    if (admin.apps.length === 0) {
      const serviceAccount = require(process.env.FCM_CRED_PATH ?? '../../erizo_fcm_cred.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendMessage(token: string, title: string, body: string, data: any) {
    try {
      const message = {
        token,
        data,
        notification: {
          title,
          body,
        },
      };
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }
}
