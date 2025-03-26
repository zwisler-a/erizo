import { ApiProperty } from '@nestjs/swagger';
import { ChallengeBodyDto } from '../challenge/challenge-body.dto';

export class AcceptConnectionRequestDto {
  @ApiProperty()
  requestId: number;
}
