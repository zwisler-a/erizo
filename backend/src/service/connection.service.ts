import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConnectionRequestDto } from '../dto/connection/connection-request.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionEntity } from '../persistance/connection.entity';
import { ThreadEntity } from '../persistance/thread.entity';
import { NotificationService, NotificationType } from './notification.service';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(ConnectionEntity) private connectionRepo: Repository<ConnectionEntity>,
    @InjectRepository(ThreadEntity) private threadRepo: Repository<ThreadEntity>,
    private notificationService: NotificationService,
  ) {}

  async createRequest(request: ConnectionRequestDto, user: UserEntity) {
    if (!user.public_key || !request.partner_fingerprint) {
      throw new Error('Invalid link request');
    }
    if (user.fingerprint == request.partner_fingerprint) throw new Error('Can not connect to yourself');
    const connectWith = await this.userRepo.findOneOrFail({ where: { fingerprint: request.partner_fingerprint } });

    const hasOtherSide = await this.connectionRepo.exists({ where: { owner: connectWith, connectedWith: user } });
    const alreadyExists = await this.connectionRepo.exists({ where: { owner: user, connectedWith: connectWith } });
    if (hasOtherSide || alreadyExists) {
      throw new HttpException('A request already exists', HttpStatus.NOT_ACCEPTABLE);
    }

    const connectionRequest = this.connectionRepo.create({
      owner: user,
      connectedWith: connectWith,
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
      relations: ['owner', 'connectedWith', 'chat', 'chat.participants'],
    });
  }

  async acceptConnectionRequest(user: UserEntity, requestId: number) {
    const request = await this.connectionRepo.findOneOrFail({
      where: { connectedWith: user, id: requestId },
      relations: ['owner', 'connectedWith'],
    });
    request.state = 'CONFIRMED';
    const otherSide = this.connectionRepo.create({
      owner: user,
      connectedWith: request.owner,
      state: 'CONFIRMED',
    });

    const chat = this.threadRepo.create({
      participants: [user, request.owner],
    });
    const directThread = await this.threadRepo.save(chat);
    request.chat = directThread;
    otherSide.chat = directThread;
    await this.connectionRepo.save([request, otherSide]);
    this.notificationService.notify(request.owner, {
      type: NotificationType.CONNECTION_ADDED,
      fingerprint: user.fingerprint,
      thread_id: directThread.id.toString(),
    });
  }

  async delete(user: UserEntity, connectionId: number) {
    const connection = await this.connectionRepo.findOneOrFail({
      where: { owner: user, id: connectionId },
      relations: { chat: true },
    });
    const otherSide = await this.connectionRepo.findOneOrFail({
      where: {
        connectedWith: user,
        owner: connection.connectedWith,
      },
    });
    await this.threadRepo.delete(connection.chat);
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
}
