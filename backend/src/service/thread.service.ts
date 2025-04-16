import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ThreadEntity } from '../persistance/thread.entity';
import { CreateThreadRequest } from '../dto/thread/create-thread.dto';
import { ConnectionService } from './connection.service';
import { PostEntity } from '../persistance/post.entity';
import { PostService } from './post.service';

@Injectable()
export class ThreadService {
  private readonly logger = new Logger(ThreadService.name);

  constructor(
    @InjectRepository(ThreadEntity) private threadRepo: Repository<ThreadEntity>,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    private postService: PostService,
    // private connectionService: ConnectionService,
  ) {}

  async getThreadById(id: number, user: UserEntity): Promise<ThreadEntity | undefined> {
    const threads = await this.threadRepo.find({ where: { id: id }, relations: { participants: true } });
    return threads.find((thread) => {
      const isOwner = thread.owner?.fingerprint == user.fingerprint;
      const isParticipant = thread.participants?.some((p) => p.fingerprint == user.fingerprint);
      return isOwner || isParticipant;
    });
  }

  async getThreads(user: UserEntity) {
    return await this.threadRepo.find({
      where: { participants: { fingerprint: user.fingerprint } },
      relations: { participants: true, owner: true },
    });
  }

  async createThread(user: UserEntity, body: CreateThreadRequest, directThread = false) {
    const allAreConnected = await Promise.all(
      body.participants.map((participant) => {
        // TODO
        // return this.connectionService.hasConnection(user.fingerprint, participant);
        return true;
      }),
    );
    const isNotConnected = allAreConnected.some((connection) => !connection);
    if (isNotConnected) {
      this.logger.error('A participant is not a friend ...');
      throw new UnauthorizedException();
    }
    const threadEntity = this.threadRepo.create({
      owner: directThread ? undefined:  { fingerprint: user.fingerprint },
      name: body.name,
      participants: [...body.participants.map((fingerprint) => ({ fingerprint })), { fingerprint: user.fingerprint }],
    });
    return this.threadRepo.save(threadEntity);
  }

  async deleteThread(user: UserEntity, threadId: number) {
    const thread = await this.threadRepo.findOneOrFail({ where: { id: threadId }, relations: { owner: true } });
    if (thread.owner != null && thread.owner.fingerprint !== user.fingerprint) throw new UnauthorizedException();
    const posts = await this.postService.fetchPostIds(user.fingerprint, threadId, 0, -1);
    const promises = posts.map((post) => this.postService.delete(post, user));
    await Promise.all(promises);
    return this.threadRepo.delete({ owner: user, id: threadId });
  }
}
