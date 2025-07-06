import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { SortType } from 'src/common/constants/pagination-enum';
import { PaginationQueryParams } from 'src/common/validations/pagination-query.dto';

export class GetDocumentRequestDto extends PaginationQueryParams {
  @IsOptional()
  @IsEnum(DOCUMENT_TYPE)
  documentType?: string;

  @IsOptional()
  @IsEnum(DOCUMENT_LANG)
  documentLang?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  sortKey: string | null = null;

  @IsOptional()
  @IsEnum(SortType, { message: 'sortType must be ASC or DESC' })
  sortType: string | null = null;
}
