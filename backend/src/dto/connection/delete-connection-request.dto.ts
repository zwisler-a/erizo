import { ApiProperty } from '@nestjs/swagger';
import { ChallengeBodyDto } from '../challenge/challenge-body.dto';

export class DeleteConnectionRequestDto {
  @ApiProperty()
  connectionId: number;
}
