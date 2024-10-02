import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType: AuthType.Bearer;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };
  constructor(
    /**
     * The Reflector class from NestJS core is injected as a dependency
     * to access and manipulate metadata within the guard.
     */
    private readonly reflactor: Reflector,

    /**
     * Injects the AccessTokenGuard as a dependency to handle
     */

    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //authTypes from the reflactor
    const authTypes = this.reflactor.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthenticationGuard.defaultAuthType];

    //show authTypes

    // console.log(authTypes);

    //array of guards
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    //print all the guards
    // console.log(guards);

    //default error
    //an error needs be thrown out whenever a user is not authorized to access specific endpoints

    const error = new UnauthorizedException();

    //loop guards and fire  canActivate
    for (const instance of guards) {
      console.log(instance);
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error: err;
      });
      // console.log(canActivate);
      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
