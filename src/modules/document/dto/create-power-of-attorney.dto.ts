import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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
  taxId: string;

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
