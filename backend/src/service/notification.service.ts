import { Injectable } from '@nestjs/common';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';

export class NotificationPayload {
  icon?: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private messagingService: MessagingService,
  ) {}

  public async notify(user: Partial<UserEntity>, title: string, body: string, data?: NotificationPayload) {
    const actualUser = await this.userRepository.findOneOrFail({ where: user, relations: { devices: true } });
    const proms = actualUser.devices.map(async (device) => {
      await this.messagingService.sendMessage(device.fcmToken, title, body, data);
    });
    await Promise.all(proms);
  }
}
