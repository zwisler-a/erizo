import { Controller, Get, HttpException, HttpStatus, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ConnectionRequestDto } from '../dto/connection-request.dto';
import { ConnectionService } from '../service/connection.service';
import { UserEntity } from '../persistance/user.entity';
import { AcceptConnectionRequestDto } from '../dto/connection-request-accept.dto';
import { AuthGuard } from '../util/auth.guard';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ConnectionEntity } from '../persistance/connection.entity';

@Controller('connection')
export class ConnectionController {
  private readonly logger = new Logger(ConnectionController.name);

  constructor(private connectionService: ConnectionService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'get-connections' })
  @ApiOkResponse({
    type: ConnectionEntity,
    isArray: true,
  })
  async getConnections(@Request() req: any) {
    const user = req.user as UserEntity;
    return this.connectionService.getConnections(user);
  }

  @Post('/request')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'request' })
  @ApiBody({ type: ConnectionRequestDto })
  async createConnectionRequest(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const body: ConnectionRequestDto = req.body;
      await this.connectionService.createRequest(body, user);
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ operationId: 'accept-request' })
  @ApiBody({ type: AcceptConnectionRequestDto })
  @Post('/request/accept')
  @UseGuards(AuthGuard)
  async acceptConnectionRequest(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      const body: AcceptConnectionRequestDto = req.body;
      await this.connectionService.acceptConnectionRequest(user, body.requestId);
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('/request/open')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'open-request' })
  @ApiOkResponse({
    type: ConnectionEntity,
    isArray: true,
  })
  async getOpenConnectionRequests(@Request() req: any) {
    try {
      const user: UserEntity = req.user;
      return this.connectionService.getOpenRequests(user);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
