import { IsNotEmpty, IsString, IsEnum, ValidateNested, IsOptional, IsEmail, IsBoolean, IsDate } from 'class-validator';
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
  @IsDate()
  @TransformDotDate()
  birthDate: Date;

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
  @IsDate()
  @TransformDotDate()
  passportIssueDate: Date;

  @IsNotEmpty()
  @IsString()
  representativeName: string;

  @IsNotEmpty()
  @IsDate()
  @TransformDotDate()
  representativeBirthDate: Date;

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
  @IsDate()
  @TransformDotDate()
  date: Date;

  @IsNotEmpty()
  @IsDate()
  @TransformDotDate()
  validUntil: Date;
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

  // TODO: Think how to choose correct dto
  @ValidateNested()
  @Type(() => PowerOfAttorneyDetailsDto)
  @IsNotEmpty()
  details: PowerOfAttorneyDetailsDto;
}
