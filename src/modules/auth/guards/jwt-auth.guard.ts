import { ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Token has expired',
          error: 'TOKEN_EXPIRED',
        });
      }

      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'No token provided',
          error: 'NO_TOKEN',
        });
      }

      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
      });
    }

    return user;
  }
}
