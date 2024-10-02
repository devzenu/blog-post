import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class PatchPostDto extends PartialType(CreatePostDto) {
  // one tag
  @ApiProperty({
    description: 'the id of the post that needs to be updated ',
  })
  //2 validation
  @IsInt()
  @IsNotEmpty()
  id: number;
}
