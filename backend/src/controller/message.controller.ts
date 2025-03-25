import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ChallengeValidationGuard } from '../util/challenge-validation.guard';
import { MessageService } from '../service/message.service';
import { MessageCreationDto } from '../dto/message-creation.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChallengeBodyDto } from '../dto/challenge/challenge-body.dto';
import { FilePointer, FileService } from '../service/file.service';
import { MessageDto } from '../dto/message.dto';
import { AuthGuard } from '../util/auth.guard';
import { UserEntity } from '../persistance/user.entity';

@Controller('message')
export class MessageController {
  private logger = new Logger(MessageController.name);

  constructor(
    private messageService: MessageService,
    private fileService: FileService,
  ) {}

  @Post('/all')
  @ApiOkResponse({
    type: MessageDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-messages' })
  async getMessages(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const messages = await this.messageService.fetchMessagesForFingerprint(user.fingerprint);
      return messages.map((message) => ({
        ...message,
        file_path: undefined,
        data: this.fileService.retrieve(new FilePointer(message.file_path)),
      }));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('chat')
  @ApiOkResponse({
    type: MessageDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-chat-messages' })
  @ApiQuery({ name: 'chatId' })
  async getMessage(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const chatId = req.query.chatId;
      const messages = await this.messageService.fetchMessages(user.fingerprint, chatId);
      return messages.map((message) => ({
        ...message,
        file_path: undefined,
        data: this.fileService.retrieve(new FilePointer(message.file_path)),
      }));
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/send')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'send' })
  @ApiBody({ type: MessageCreationDto })
  async upload(@Request() req: any) {
    try {
      const body = req.body as MessageCreationDto;
      await this.messageService.create(body);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { error: error.message };
    }
  }
}
