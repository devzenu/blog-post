//import { Injectable, Inject, forwardRef } from '@nestjs/common';

import { GetUsersParamDto } from '../dtos/get-user-param.dto';
//import { AuthService } from 'src/auth/provider/auth.service';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ConfigType } from '@nestjs/config';
import profileConfig from '../config/profile.config';
import { UserCreateManyProvider } from './user-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

/**
 * controller class for "/users" Api endpoint
 */

@Injectable()
export class UserService {
  constructor(
    /**
     *  Injecting usersRepository
     */

    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    /**
     * Inject usersCreateManyProvider
     */
    private readonly usersCreateManyProvider: UserCreateManyProvider,

    /**
     * Inject create users provider
     */
    private readonly createUserProvider: CreateUserProvider,

    /**
     * Inject findOneUserByEmailProvider
     */
    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  /**
   * Public method responsible for handling GET request for '/users' endpoint
   */

  public findAll(
    getUsersParamDto: GetUsersParamDto,
    limit: number,
    page: number,
  ) {
    //custom  exception

    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'The API end points doesnot exist',
        fileName: 'users.service.ts',
        lineNumber: 92,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        cause: new Error(),
        description: 'Occured because tha Api endpoints was permanently moved ',
      },
    );

    /* //test the new config
    console.log(this.profileConfiguration);
    return [
      {
        firstName: 'jhon',
        emai: 'dev@fo.com',
      },
      {
        firstName: 'pumpkin',
        email: 'pumkin@vag.com',
      },
    ]; */
  }

  /*
    find a user  by ID 
    in case we are using data base as of now  i'll just simply return the following 
    object that is firstname,email additionaly we also want to return id .so 
    id just be an arbitary number as of now 
   */

  // here we use the compo doc to discommented our code if you dont remember by any chance
  //you can watch the note and compo doc vide

  /**
   * Public method used to find one user using the ID of the user
   */
  public async findOneById(id: number) {
    let user = undefined;
    try {
      user = await this.usersRepository.findOneBy({
        id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'unable to process the application, please try later',
        {
          description: 'Error  connecting to the database ',
        },
      );
    }
    /**
     * Handle the user does not exist exception
     */

    if (!user) {
      throw new BadRequestException('this user Id  does not exist');
    }
    return user;
  }

  // creating many users with the help of creating multiple providers
  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createManyUsersDto);
  }
  public async findOneByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findOneByEmail(email);
  }
}
