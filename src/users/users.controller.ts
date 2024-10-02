import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  //SetMetadata,
  // UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersParamDto } from './dtos/get-user-param.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UserService } from './providers/user.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
//import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';

//http://localhost:8000/users
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    //injecting userServices
    private readonly userServices: UserService,
  ) {}
  @Get('/:id?')
  @ApiOperation({
    summary: ' Fetches a list of registered users on the application ',
  })
  @ApiResponse({
    status: 200,
    description: 'users fetched successfully based on the query ',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'The number of entries returned per query',
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description:
      'The position of the page number that you want the Api to return ',
    example: 1,
  })
  public getUsers(
    @Param() getUsersParamDto: GetUsersParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.userServices.findAll(getUsersParamDto, limit, page);
  }
  //creating single user
  @Post()
  //@SetMetadata('authType', 'none')now instead of using setmetadata
  // we use our own custom decorators that i have created that is auth decorator
  @Auth(AuthType.None)
  public createUsers(@Body() createUserDto: CreateUserDto) {
    // console.log(createUserDto instanceof CreateUserDto);

    return this.userServices.createUser(createUserDto);
  }

  // creating many users

  @Post('create-many')
  public createManyUsers(@Body() createManyUsersDto: CreateManyUsersDto) {
    //console.log(createManyUsersDto instanceof CreateManyUsersDto);
    return this.userServices.createMany(createManyUsersDto);
  }
  @Patch()
  public patchUser(@Body() patchUserDto: PatchUserDto) {
    return patchUserDto;
  }
}
