import { ApiProperty } from '@nestjs/swagger';

export class RecipientList {
  @ApiProperty()
  fingerprint: string;
  @ApiProperty()
  encryption_key: string;
}

export class CreatePostDto {
  @ApiProperty()
  data: string;
  @ApiProperty()
  message: string;
  @ApiProperty()
  thread_id: number;
  @ApiProperty()
  iv: string;
  @ApiProperty({ isArray: true, type: RecipientList })
  recipients: RecipientList[];
  @ApiProperty()
  sender_fingerprint: string;
  @ApiProperty({ required: false })
  days_to_live?: number;
  @ApiProperty({ required: false })
  nsfw?: boolean;
}
