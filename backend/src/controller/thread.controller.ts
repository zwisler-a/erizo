import { Controller, Delete, Get, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';
import { ThreadService } from '../service/thread.service';
import { ThreadEntity } from '../persistance/thread.entity';
import { CreateThreadRequest } from '../dto/thread/create-thread.dto';

@ApiTags('Thread')
@Controller('thread')
export class ThreadController {
  private readonly logger = new Logger(ThreadController.name);

  constructor(private threadService: ThreadService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'getThread' })
  @ApiQuery({ name: 'threadId' })
  @ApiOkResponse({ type: ThreadEntity })
  async getThread(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      const body = req.query.threadId as string;
      this.logger.debug(`Getting thread ${body}`);
      return await this.threadService.getThreadById(Number.parseInt(body), user);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'getThreads' })
  @ApiOkResponse({ type: ThreadEntity, isArray: true })
  async getThreads(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      this.logger.debug(`Getting all threads ${req.user.fingerprint}`);
      return await this.threadService.getThreads(user);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('new')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createThread' })
  @ApiBody({ type: CreateThreadRequest })
  @ApiOkResponse({ type: ThreadEntity })
  async createThread(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      const body = req.body as CreateThreadRequest;
      this.logger.debug(`Creating a thread ${req.user.fingerprint}`);
      return await this.threadService.createThread(user, body);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteThread' })
  @ApiQuery({ name: 'threadId' })
  async deleteThread(@Request() req: any) {
    try {
      const user = req.user as UserEntity;
      const threadId = req.query.threadId as string;
      this.logger.debug(`Delete a thread ${req.user.fingerprint}`);
      return await this.threadService.deleteThread(user, Number.parseInt(threadId));
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
