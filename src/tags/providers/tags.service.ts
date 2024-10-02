import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Tag } from '../tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTagDto } from '../dtos/create-tags.dto';

@Injectable()
export class TagsService {
  constructor(
    /**
     * Injecting tagRepositroy
     */
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  public async create(createTagDto: CreateTagDto) {
    let tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  // find multiple tags

  public async findMultipleTgas(tags: number[]) {
    let results = this.tagsRepository.find({
      where: {
        id: In(tags),
      },
    });
    return results;
  }

  // delete tags method
  // i have a one question where should i use findOneBy , findOne ,etc

  public async delete(id: number) {
    await this.tagsRepository.delete(id);
    return {
      deleted: true,
      id,
    };
  }

  public async softRemove(id: number) {
    await this.tagsRepository.softDelete(id);
    return {
      deleted: true,
      id,
    };
  }
}
