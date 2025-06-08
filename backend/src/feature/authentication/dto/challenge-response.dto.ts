import { ApiProperty } from '@nestjs/swagger';

export class ChallengeResponse {
  @ApiProperty()
  challenge: string;
}