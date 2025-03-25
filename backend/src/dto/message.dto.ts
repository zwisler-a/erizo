import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from '../persistance/message.entity';

export class MessageDto extends MessageEntity {
  @ApiProperty()
  data: string;
}
