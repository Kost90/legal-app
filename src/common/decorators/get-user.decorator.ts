import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/modules/auth/types/jwtPayload.interface';

export const getUserDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
