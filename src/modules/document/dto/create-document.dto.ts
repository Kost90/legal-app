import { IsEmail, IsNotEmpty, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { DOCUMENT_TYPE, DOCUMENT_LANG } from 'src/common/constants/documents-type.enum';
import { PowerOfAttorneyDetailsDto } from './create-power-of-attorney.dto';
import { PowerOfAttorneyDocumentsDto } from './create-power-of-attorney-documents.dto';

export class CreateDocumentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  isPaid: boolean;

  @IsEnum(DOCUMENT_TYPE)
  @IsNotEmpty()
  documentType: DOCUMENT_TYPE;

  @IsEnum(DOCUMENT_LANG)
  @IsNotEmpty()
  documentLang: DOCUMENT_LANG;

  @IsObject()
  @IsNotEmpty()
  details: PowerOfAttorneyDetailsDto | PowerOfAttorneyDocumentsDto;
}
