import { ApiProperty } from '@nestjs/swagger';
import { ChallengeRequestDto } from './challenge/challenge-request.dto';

export class RecipientList {
  @ApiProperty()
  fingerprint: string;
  @ApiProperty()
  encryption_key: string;
}

export class MessageCreationDto {
  @ApiProperty()
  data: string;
  @ApiProperty()
  message: string;
  @ApiProperty()
  chat_id: number;
  @ApiProperty()
  iv: string;
  @ApiProperty({isArray: true, type: RecipientList})
  recipients: RecipientList[];
  @ApiProperty()
  sender_fingerprint: string;
  @ApiProperty({ required: false })
  days_to_live?: number;
}
