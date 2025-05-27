import {
  IsNotEmpty,
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsDateString,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

export class PropertyAddres {
  @IsString()
  city: string;

  @IsString()
  street: string;

  @IsString()
  buildNumber: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  postCode?: string;
}

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
  @IsDateString()
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

  @IsOptional()
  @IsNotEmpty()
  @Type(() => PropertyAddres)
  propertyAddress: PropertyAddres;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsDateString()
  validUntil: string;
}

export class CreatePowerOfAttorneyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  isPaid: boolean;

  @IsEnum(DOCUMENT_TYPE)
  @IsNotEmpty()
  documentType: string;

  @IsEnum(DOCUMENT_LANG)
  @IsNotEmpty()
  documentLang: DOCUMENT_LANG;

  @ValidateNested()
  @Type(() => PowerOfAttorneyDetailsDto)
  @IsNotEmpty()
  details: PowerOfAttorneyDetailsDto;
}
