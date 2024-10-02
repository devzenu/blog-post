/* eslint-disable prefer-const */
import {
  BadRequestException,
  Body,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UserService } from 'src/users/providers/user.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../post.entity';
import { Repository } from 'typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dto/patch-post.dto';
import { GetPostsDto } from '../dto/get-post.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Injectable()
export class PostsService {
  constructor(
    /**
     * inject User service
     */

    private readonly usersServices: UserService,

    /**
     * Injecting post repositary
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    /**
     * Injecting metaOptions repositary
     */
    @InjectRepository(MetaOption)
    private readonly metaOptonsRepository: Repository<MetaOption>,

    /**
     * Inject tagService
     */

    private readonly tagsService: TagsService,

    /**
     * Injecting paginationProvider
     */
    private readonly paginationProvider: PaginationProvider,
  ) {}

  /**
   * creating new posts
   */

  public async create(@Body() createPostDto: CreatePostDto) {
    // find author  from database  based  on authorId

    let author = await this.usersServices.findOneById(createPostDto.authorId);
    //find tags
    let tags = await this.tagsService.findMultipleTgas(createPostDto.tags);

    // 2-create post
    let post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      tags: tags,
    });

    // 4- return the post to the user

    return await this.postsRepository.save(post);
  }

  public async findAll(
    postQuery: GetPostsDto,
    userId: string,
  ): Promise<paginated<Post>> {
    let posts = await this.paginationProvider.paginateQuery(
      {
        limit: postQuery.limit,
        page: postQuery.page,
      },
      this.postsRepository,
    );
    return posts;
  }

  //deleting post and metaOPtions

  public async delete(id: number) {
    await this.postsRepository.delete(id);
    return { deleted: true, id };
  }

  //Updating post with new New Tags

  public async update(patchPostDto: PatchPostDto) {
    let tags = undefined;
    let post = undefined;

    // 1- find tags
    try {
      tags = await this.tagsService.findMultipleTgas(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at this moment please try later',
      );
    }

    /**
     * Number of tags need to be equal
     */
    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'pease check your tags Ids and ensure they are correct',
      );
    }

    //2-find the existing  post

    try {
      post = await this.postsRepository.findOneBy({
        id: patchPostDto.id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at this moment please try later',
      );
    }

    if (!post) {
      throw new BadRequestException('The post ID does not exist');
    }
    //3-Upadate the properties of post

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishedOn = patchPostDto.publishedOn ?? post.publishedOn;

    //4- assign the new tags to the post
    post.tags = tags;
    // this particular line of code should update the tags as wel ason the post obje

    //save the post and return it
    try {
      await this.postsRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at this moment please try later',
      );
    }
    return post;
  }
}
