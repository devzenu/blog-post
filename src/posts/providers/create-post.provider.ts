import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from 'src/tags/providers/tags.service';
import { UserService } from 'src/users/providers/user.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class CreatePostProvider {
  constructor(
    /**
     * inject postrepository
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    /**
     * Inject tag service
     */
    private readonly tagsService: TagsService,
    /**
     * Injecting userService
     */
    private readonly usersService: UserService,
  ) {}
  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    // find author  from database  based  on authorId
    let author = undefined;
    let tags = undefined;

    try {
      author = await this.usersService.findOneById(user.sub);
      //find tags
      tags = await this.tagsService.findMultipleTgas(createPostDto.tags);
    } catch (error) {
      throw new ConflictException(error);
    }
    if (createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('please check  your tag ids ');
    }
    // 2-create post
    let post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      tags: tags,
    });

    try {
      // 4- return the post to the user

      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Enusre post slug is unique and should not a duplicate ',
      });
    }
  }
}
