import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../../persistance/post.entity';

export class PostDto extends PostEntity {
  @ApiProperty()
  data: string;
}
