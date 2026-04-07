import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserType } from '../../modules/auth/domain/user.entity';
import { Request } from 'express';

interface AuthenticatedUser {
  UserId: string;
  UserType: UserType;
}

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || user.UserType !== UserType.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    return true;
  }
}
