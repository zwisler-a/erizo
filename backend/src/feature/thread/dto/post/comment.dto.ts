import { ApiProperty } from '@nestjs/swagger';

export class RecipientList {
  @ApiProperty()
  fingerprint: string;
  @ApiProperty()
  encryption_key: string;
}

export class CreateCommentDto {
  @ApiProperty()
  content: string;
  @ApiProperty()
  post_id: number;
  @ApiProperty()
  iv: string;
  @ApiProperty({ isArray: true, type: RecipientList })
  recipients: RecipientList[];
  @ApiProperty()
  sender_fingerprint: string;
}
