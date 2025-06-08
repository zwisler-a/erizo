import { Body, Controller, HttpException, HttpStatus, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { ChallengeService } from '../service/challenge.service';
import { ChallengeRequestDto } from '../dto/challenge/challenge-request.dto';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { ChallengeBodyDto } from '../dto/challenge/challenge-body.dto';
import { RegisterDto } from '../dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../persistance/user.entity';
import { Repository } from 'typeorm';
import { ChallengeResponse } from '../dto/challenge/challenge-response.dto';
import { ChallengeVerifyDto } from '../dto/challenge/challenge-verify.dto';

@ApiTags('Authentication')
@Controller('auth')
export class ChallengesController {

  private logger: Logger = new Logger(ChallengesController.name);

  constructor(
    @InjectRepository(UserEntity)
    private identityRepository: Repository<UserEntity>,
    private challengeService: ChallengeService,
    private userService: UserService,
  ) {}

  @ApiOperation({ operationId: 'register' })
  @Post('/register')
  async registerUser(@Body() body: RegisterDto) {
    try {
      const { fingerprint, public_key } = body;
      await this.identityRepository.upsert({ fingerprint: fingerprint, public_key: public_key }, ['fingerprint']);
    } catch (error: any) {
      this.logger.error(error);
      throw new HttpException('Something went wrong!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ operationId: 'get-challenge' })
  @Post('/challenge')
  @ApiOkResponse({
    type: ChallengeResponse,
  })
  async getChallenge(@Body() body: ChallengeRequestDto) {
    const { claimed_key } = body;
    try {
      await this.userService.getUserOrFailByKey(claimed_key);
    } catch (error) {
      throw new UnauthorizedException();
    }
    return this.challengeService.createChallenge(claimed_key);
  }

  @ApiOperation({ operationId: 'verify-challenge' })
  @Post('/verify-challenge')
  @ApiOkResponse({
    type: ChallengeVerifyDto,
  })
  async verifyChallenge(@Body() body: ChallengeBodyDto) {
    return this.userService.signIn(body.challenge_token);
  }
}
