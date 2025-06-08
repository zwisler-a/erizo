import { ApiProperty } from '@nestjs/swagger';
import { ChallengeBodyDto } from '../../authentication/dto/challenge-body.dto';

export class DeleteConnectionRequestDto {
  @ApiProperty()
  connectionId: number;
}
