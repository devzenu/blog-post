import { Injectable, Inject } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { ObjectLiteral, Repository } from 'typeorm';

import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { paginated } from '../interfaces/paginated.interface';
// here i made a mistake i should write the capital for interfecae paginated 
// but somehow i write small paginated ,i cant not chnage beacus u use this in my things soo 
// just keep going 
@Injectable()
export class PaginationProvider {
  constructor(
    /**
     * Injecting Request
     */
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<paginated<T>> {
    let results = await repository.find({
      skip: (paginationQuery.page - 1) * paginationQuery.limit,
      take: paginationQuery.limit,
    });

    /**
     * create the Request URLs
     */
    const baseURL =
      this.request.protocol + '://' + this.request.headers.host + '/';
    //now in order to genaret the new URL object ,use the new the new URL CLASS CONSTRUCTOR method
    const newUrl = new URL(this.request.url, baseURL);
    console.log(newUrl);
    //calculating the page nmber
    //1st we calculate the total number of items in db the we do calcualate page
    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / paginationQuery.limit);
    //i'm also going to take an oppertunity to calculate the next page as well as prev.page
    const nextPage =
      paginationQuery.page == totalPages
        ? paginationQuery.page
        : paginationQuery.page + 1;

    const previousPage =
      paginationQuery.page == 1
        ? paginationQuery.page
        : paginationQuery.page - 1;

    const finalResponse: paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: paginationQuery.limit,
        totalItems: totalItems,
        currentPage: paginationQuery.page,
        totalPage: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page= ${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${paginationQuery.page}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${previousPage}`,
      },
    };

    return finalResponse;
  }
}
