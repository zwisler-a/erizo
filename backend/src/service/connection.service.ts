import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConnectionRequestDto } from '../dto/connection-request.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionEntity } from '../persistance/connection.entity';
import { ChatEntity } from '../persistance/chat.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(ConnectionEntity) private connectionRepo: Repository<ConnectionEntity>,
    @InjectRepository(ChatEntity) private chatRepo: Repository<ChatEntity>,
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
    return await this.connectionRepo.find({ where: { owner: user }, relations: ['owner', 'connectedWith', 'chat', 'chat.participants'] });
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

    const chat = this.chatRepo.create({
      participants: [user, request.owner],
    });
    const directChat = await this.chatRepo.save(chat);
    request.chat = directChat;
    otherSide.chat = directChat;
    await this.connectionRepo.save([request, otherSide]);
  }
}
