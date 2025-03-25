import { ApiProperty } from '@nestjs/swagger';

export class ChallengeVerifyDto {
  @ApiProperty()
  access_token: string;
}
