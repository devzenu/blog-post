import { Injectable } from '@nestjs/common';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-meta-options.dto';
import { Repository } from 'typeorm';
import { MetaOption } from '../meta-option.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MetaOptionsService {
  constructor(
    /**
     *Inject metaOptionRepositary
     remeber if you want to inject any repositary properly we need to use the inject
    reppostary decorator as well 
     */
    @InjectRepository(MetaOption)
    private readonly metaOptionsRepositary: Repository<MetaOption>,
  ) {}
  public async create(createMetaOptionsDto: CreatePostMetaOptionsDto) {
    let metaOption = this.metaOptionsRepositary.create(createMetaOptionsDto);
    return await this.metaOptionsRepositary.save(metaOption);
  }
}
