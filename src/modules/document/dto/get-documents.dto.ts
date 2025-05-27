import { IsEnum, IsOptional } from 'class-validator';

import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

export class GetDocumentRequestDto {
  @IsEnum(DOCUMENT_TYPE)
  documentType: string;

  @IsOptional()
  @IsEnum(DOCUMENT_LANG)
  documentLang?: string;
}
