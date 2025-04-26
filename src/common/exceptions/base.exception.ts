import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  private _message: any;
  constructor(message?: string | any, code?: string, statusCode?: number) {
    super({ code, message }, statusCode || 400);
    this._message = message;
  }

  toString() {
    return Array.isArray(this._message) ? this._message.join(';\n') : this._message.toString();
  }
}
