import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
//import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../user.entity';
import { DataSource } from 'typeorm';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

@Injectable()
export class UserCreateManyProvider {
  constructor(
    /**
     * Inject Datasource
     */

    private readonly dataSource: DataSource,
  ) {}

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    let newUsers: User[] = [];
    //1-create Query runner instance
    const queryRunner = this.dataSource.createQueryRunner();
    //only two lines of code that intract with the db are inside the trycatch block now
    try {
      //2-connect Query runner to datasource
      await queryRunner.connect();
      //3-start with the transaction
      await queryRunner.startTransaction();
    } catch (error) {
      // for somereasons if we're not able to start a transaction or connect
      //to  datasource, so lets just go ahead and throw a new exception
      throw new RequestTimeoutException('could not connect to the db');
    }

    //4- if successful transaction, you can go ahead &commit this particular transction to db
    try {
      for (let user of createManyUsersDto.users) {
        let newUser = queryRunner.manager.create(User, user);
        let result = await queryRunner.manager.save(newUser);
        newUsers.push(result);
      }
      //if successfull transaction commit
      await queryRunner.commitTransaction();
    } catch (error) {
      //5-if unsuccess transaction ,rollback
      // // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      // now what if this transaction is completed successfully
      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      try {
        // relase connection
        //you need to release a queryRunner which was manually instantiated
        await queryRunner.release();
      } catch (error) {
        // if the connection is not released by any chance , i am going to throw an error again
        throw new RequestTimeoutException(
          'Could not release the query runner connection',
          {
            description: String(error),
          },
        );
      }
    }
    return newUsers;
    //return { users: newUsers };

    // 6-so once the connection has done its job , your transation is complete either successfully or unscufully
    // relase connection
  }
}
