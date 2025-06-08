import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../../model/post.entity';

export class PostDto extends PostEntity {
  @ApiProperty()
  data: string;
}
