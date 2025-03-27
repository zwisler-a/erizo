import { Controller, Get, HttpException, HttpStatus, Logger, Request, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';
import { ThreadService } from '../service/thread.service';
import { ThreadEntity } from '../persistance/thread.entity';

@ApiTags('Thread')
@Controller('thread')
export class ThreadController {
  private readonly logger = new Logger(ThreadController.name);

  constructor(private threadService: ThreadService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'getThread' })
  @ApiQuery({ name: 'threadId' })
  @ApiOkResponse({type: ThreadEntity})
  async createDevice(@Request() req: any) {
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
}
