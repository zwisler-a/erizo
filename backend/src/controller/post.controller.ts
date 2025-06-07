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
import {CreatePostResponseDto} from "../dto/post/create-post-response.dto";

@Controller('post')
export class PostController {
  private logger = new Logger(PostController.name);

  constructor(private postService: PostService) {}

  @Get('/all/ids')
  @ApiOkResponse({
    type: IdsPage,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-all-post-ids' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  async getAllPostIds(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number) {
    try {
      const user: UserEntity = req.user;
      this.logger.debug(`Getting all posts for user: ${user.fingerprint}, page ${page}, limit: ${limit}`);
      const ids = await this.postService.fetchPostIdsFor(user.fingerprint, page, limit);
      return new IdsPage(page, limit, ids);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('thread/ids')
  @ApiOkResponse({
    type: IdsPage,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-post-ids-in-thread' })
  @ApiQuery({ name: 'threadId' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  async getPostIdsForThread(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('threadId') threadId: number,
  ) {
    try {
      const user: UserEntity = req.user;
      this.logger.debug(`Getting all posts for thread: ${threadId} ${user.fingerprint}, page ${page}, limit: ${limit}`);
      const ids = await this.postService.fetchPostIds(user.fingerprint, threadId, page, limit);
      return new IdsPage(page, limit, ids);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('')
  @ApiOkResponse({
    type: PostDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-posts' })
  @ApiQuery({ name: 'ids', isArray: true, type: Number })
  async getPosts(@Request() req: any, @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[]) {
    try {
      const user: UserEntity = req.user;
      if (!ids) return [];
      this.logger.debug(`Getting posts for user: ${user.fingerprint}, page [${ids.join(',')}]`);
      return await this.postService.fetchPosts(user.fingerprint, ids);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/publish')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'publish' })
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({type: CreatePostResponseDto})
  async upload(@Request() req: any): Promise<CreatePostResponseDto> {
    try {
      const body = req.body as CreatePostDto;
      const user = req.user as UserEntity;
      this.logger.debug(`Creating post from user ${user.fingerprint} ${body.thread_id}`);
      const entity = await this.postService.create(body, user);
      return {post_id: entity.id};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Post('/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'like' })
  @ApiQuery({ name: 'postId' })
  async likePost(@Request() req: any) {
    try {
      const body = req.query.postId as string;
      const user = req.user as UserEntity;
      this.logger.debug(`Liking post from user ${user.fingerprint} ${body}`);
      await this.postService.like(body, user);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { error: error.message };
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'delete' })
  @ApiQuery({ name: 'postId' })
  async deletePost(@Request() req: any) {
    try {
      const body = req.query.postId as string;
      const user = req.user as UserEntity;
      this.logger.debug(`Delete post ${user.fingerprint} ${body}`);
      await this.postService.delete(Number.parseInt(body), user);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { error: error.message };
    }
  }
}
