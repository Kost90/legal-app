import { IsNotEmpty, IsString, IsDate } from 'class-validator';

import { TransformDotDate } from 'src/common/transformers/transformStringToDate';

export class PowerOfAttorneyDocumentsDto {
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
  passportIssueAuthority: string;

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
