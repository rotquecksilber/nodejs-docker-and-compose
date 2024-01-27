import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (_e) {
      return true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, _context: any, status: any) {
    return user || null;
  }
}
