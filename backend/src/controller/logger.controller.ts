import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  ParseArrayPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../service/post.service';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostDto } from '../dto/post/post.dto';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';
import { IdsPage } from '../dto/page.dto';

@Controller('log')
export class LoggerController {
  private logger = new Logger(LoggerController.name);

  constructor(private postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: Error })
  @ApiOperation({ operationId: 'log' })
  async getAllPostIds(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const error: Error = req.body;
      this.logger.warn(`[UI: ${user.fingerprint}]: ${JSON.stringify(error)}`);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
