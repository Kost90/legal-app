import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { SortType } from '../constants/pagination-enum';

export class PaginationQueryParams {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page = 1;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  limit = 20;
}

export class PaginationObject {
  currentPage: number;
  totalPages: number;
  totalResult: number;
}

export class FindingResults<T> {
  items: T[];

  @Type(() => PaginationObject)
  pagination?: PaginationObject;
}

export class SortableItem {
  id: string;
  name?: string;
  order: number;
}

export class SortQueryParams {
  @Type(() => String)
  @IsString()
  @IsOptional()
  sortKey: string | null = null;

  @IsOptional()
  @IsEnum(SortType, { message: 'sortType must be ASC or DESC' })
  sortType: string | null = null;
}
