import { ApiProperty } from '@nestjs/swagger';
import { ChallengeBodyDto } from '../../authentication/dto/challenge-body.dto';

export class AcceptConnectionRequestDto {
  @ApiProperty()
  requestId: number;

  @ApiProperty()
  alias: string;
}
