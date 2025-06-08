import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConnectionRequestDto } from '../dto/connection-request.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../authentication/model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionEntity } from '../model/connection.entity';
import { NotificationService, NotificationType } from '../../notification/service/notification.service';
import { ThreadService } from '../../thread/service/thread.service';
import { UserService } from '../../authentication';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity) private connectionRepo: Repository<ConnectionEntity>,
    private threadService: ThreadService,
    private notificationService: NotificationService,
    private userService: UserService,
  ) {}

  async createRequest(request: ConnectionRequestDto, user: UserEntity) {
    if (!user.public_key || !request.partner_fingerprint) {
      throw new Error('Invalid link request');
    }
    if (user.fingerprint == request.partner_fingerprint) throw new Error('Can not connect to yourself');
    const connectWith = await this.userService.getUserOrFail(request.partner_fingerprint);

    const hasOtherSide = await this.connectionRepo.exists({ where: { owner: connectWith, connectedWith: user } });
    const alreadyExists = await this.connectionRepo.exists({ where: { owner: user, connectedWith: connectWith } });
    if (hasOtherSide || alreadyExists) {
      throw new HttpException('A request already exists', HttpStatus.NOT_ACCEPTABLE);
    }

    const connectionRequest = this.connectionRepo.create({
      owner: user,
      connectedWith: connectWith,
      alias: request.alias,
      state: 'PENDING',
    });
    await this.connectionRepo.save(connectionRequest);
    this.notificationService.notify(connectWith, {
      type: NotificationType.CONNECTION_REQUEST,
      fingerprint: user.fingerprint,
    });
  }

  async getOpenRequests(user: UserEntity) {
    return await this.connectionRepo.find({
      where: {
        connectedWith: user,
        state: 'PENDING',
      },
      relations: ['owner', 'connectedWith'],
    });
  }

  async getConnections(user: UserEntity) {
    return await this.connectionRepo.find({
      where: { owner: user },
      relations: { thread: { participants: true }, connectedWith: true, owner: true },
    });
  }

  async acceptConnectionRequest(user: UserEntity, requestId: number, alias: string) {
    const request = await this.connectionRepo.findOneOrFail({
      where: { connectedWith: user, id: requestId },
      relations: { owner: true, connectedWith: true },
    });
    request.state = 'CONFIRMED';
    const otherSide = this.connectionRepo.create({
      owner: user,
      alias,
      connectedWith: request.owner,
      state: 'CONFIRMED',
    });

    const thread = await this.threadService.createThread(
      user,
      {
        participants: [user.fingerprint, request.owner.fingerprint],
      },
      true,
    );
    request.thread = thread;
    otherSide.thread = thread;
    await this.connectionRepo.save([request, otherSide]);
    await this.notificationService.notify(request.owner, {
      type: NotificationType.CONNECTION_ADDED,
      fingerprint: user.fingerprint,
      thread_id: thread.id.toString(),
    });
  }

  async delete(user: UserEntity, connectionId: number) {
    const connection = await this.connectionRepo.findOneOrFail({
      where: { owner: user, id: connectionId },
      relations: { thread: true, connectedWith: true },
    });
    const otherSide = await this.connectionRepo.findOneOrFail({
      where: {
        connectedWith: user,
        owner: connection.connectedWith,
      },
    });
    await this.threadService.deleteThread(user, connection.thread.id);
    await this.connectionRepo.delete(connection);
    await this.connectionRepo.delete(otherSide);
    return true;
  }

  async hasConnection(fromFingerprint: string, toFingerprint: string) {
    const connection = await this.connectionRepo.findOne({
      where: {
        owner: { fingerprint: fromFingerprint },
        connectedWith: { fingerprint: toFingerprint },
        state: 'CONFIRMED',
      },
    });
    return !!connection;
  }

  async setAlias(id: number, alias: string, user: UserEntity) {
    const connection = await this.connectionRepo.findOneOrFail({ where: { id, owner: user } });
    connection.alias = alias;
    return await this.connectionRepo.save(connection);
  }
}
