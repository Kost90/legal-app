import { IsNotEmpty, IsString, IsEnum, ValidateNested, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { TransformDotDate } from 'src/common/transformers/transformStringToDate';

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
  @TransformDotDate()
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
  @TransformDotDate()
  passportIssueDate: string;

  @IsNotEmpty()
  @IsString()
  representativeName: string;

  @IsNotEmpty()
  @IsString()
  @TransformDotDate()
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
  @IsString()
  @TransformDotDate()
  date: string;

  @IsNotEmpty()
  @IsString()
  @TransformDotDate()
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
