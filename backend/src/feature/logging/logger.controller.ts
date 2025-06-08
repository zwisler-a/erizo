import { Controller, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../authentication/guard/auth.guard';
import { UserEntity } from '../authentication/model/user.entity';

@Controller('log')
export class LoggerController {
  private logger = new Logger(LoggerController.name);

  constructor() {}

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
