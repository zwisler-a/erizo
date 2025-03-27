import { Controller, Delete, Get, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { PostService } from '../service/post.service';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostDto } from '../dto/post/post.dto';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';

@Controller('post')
export class PostController {
  private logger = new Logger(PostController.name);

  constructor(private postService: PostService) {}

  @Post('/all')
  @ApiOkResponse({
    type: PostDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-all-posts' })
  async getAllPosts(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      this.logger.debug(`Getting all posts for user: ${user.fingerprint}`);
      return await this.postService.fetchPostsFor(user.fingerprint);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('thread')
  @ApiOkResponse({
    type: PostDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-posts-in-thread' })
  @ApiQuery({ name: 'threadId' })
  async getPostsForThread(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const chatId = req.query.chatId;
      this.logger.debug(`Getting all posts for thread: ${chatId} ${user.fingerprint}`);
      return await this.postService.fetchPosts(user.fingerprint, chatId);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/publish')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'publish' })
  @ApiBody({ type: CreatePostDto })
  async upload(@Request() req: any) {
    try {
      const body = req.body as CreatePostDto;
      const user = req.user as UserEntity;
      this.logger.debug(`Creating post from user ${user.fingerprint} ${body.chat_id}`);
      await this.postService.create(body, user);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { error: error.message };
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
