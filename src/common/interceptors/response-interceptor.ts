import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SuccessResponseDTO } from '../dto/succsess-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponseDTO<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponseDTO<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: 200,
        timestamp: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
      })),
    );
  }
}
