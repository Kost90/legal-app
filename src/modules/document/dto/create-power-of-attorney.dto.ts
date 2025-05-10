import { IsNotEmpty, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

export class PowerOfAttorneyDetailsDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  tin: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  passport: string;

  @IsNotEmpty()
  @IsString()
  passportIssueDate: string;

  @IsNotEmpty()
  @IsString()
  representativeName: string;

  @IsNotEmpty()
  @IsString()
  representativeBirthDate: string;

  @IsNotEmpty()
  @IsString()
  representativeTIN: string;

  @IsNotEmpty()
  @IsString()
  representativeAddress: string;

  @IsNotEmpty()
  @IsString()
  propertyAddress: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  validUntil: string;
}

export class CreatePowerOfAttorneyDto {
  @IsEnum(DOCUMENT_TYPE)
  @IsNotEmpty()
  documentType: string;

  @IsEnum(DOCUMENT_LANG)
  @IsNotEmpty()
  documentLang: string;

  @ValidateNested()
  @Type(() => PowerOfAttorneyDetailsDto)
  @IsNotEmpty()
  details: PowerOfAttorneyDetailsDto;
}
