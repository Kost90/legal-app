import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotExistException extends BaseException {
  constructor(name: string) {
    super(`${name} does not exist`, `${name}_does_not_exist`, HttpStatus.NOT_FOUND);
  }
}

export class AlreadyExistsException extends BaseException {
  constructor(name: string) {
    super(`User already exists`, `409`, HttpStatus.CONFLICT);
  }
}

export class UnAuthorizedException extends BaseException {
  constructor(message = '') {
    super(`Unauthorized: This api requires authentication.${message || ''}`, `Unauthorized`, HttpStatus.UNAUTHORIZED);
  }
}
