import { Type } from 'class-transformer';
import { FindingResults } from '../validations/pagination-query.dto';

export class SuccessResponseDTO<T> {
  statusCode: number;
  message: string;
  data: T;
}

export class ApiPaginatedResponseDTO<T> {
  @Type(() => FindingResults<T>)
  data: FindingResults<T>;
  statusCode?: number;
  message?: string;
}
