import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UserService } from 'src/users/providers/user.service';
import { HashingProvider } from './hasing.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class SignInProvider {
  //we need the userservice to find one user by email with in the mthod that we had created
  constructor(
    /**
     * inject userService
     */
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    /**
     * Inject HashingProvider
     */

    private readonly hashingProvider: HashingProvider,
    /**
     * Inject jwt service
     */
    // we  inject this service through nestjs/jwt
    private readonly jwtService: JwtService,
    /**
     * Inject Jwt configuartion
     */
    // this is agin imported from nest js / config

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  public async signIn(signInDto: SignInDto) {
    //followig steps we should take to sign in the user
    //1-find the user using email id
    //2-thorw an exception if the user not found
    let user = await this.userService.findOneByEmail(signInDto.email);
    //3-if user found then copmare the password to hash

    let isEqual: boolean = false;
    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the passwords',
      });
    }
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }

    // genrating jwt accesstoken
    const accessToken = await this.jwtService.signAsync(
      {
        // for the id of user we will pass sub .. means subject
        sub: user.id,
        email: user.email,
      } as ActiveUserData,
      //another argument we pass here thats itself is object
      // this object take all required particular information thats required in genrating jwt token
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    );
    return {
      accessToken,
    };
  }
}
