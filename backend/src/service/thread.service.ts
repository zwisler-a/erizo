import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ThreadEntity } from '../persistance/thread.entity';

@Injectable()
export class ThreadService {
  constructor(@InjectRepository(ThreadEntity) private threadRepo: Repository<ThreadEntity>) {}

  async getThreadById(id: number, user: UserEntity): Promise<ThreadEntity | undefined> {
    const threads = await this.threadRepo.find({ where: { id: id }, relations: { participants: true } });
    return threads.find((thread) => {
      const isOwner = thread.owner?.fingerprint == user.fingerprint;
      const isParticipant = thread.participants?.some((p) => p.fingerprint == user.fingerprint);
      return isOwner || isParticipant;
    });
  }
}
