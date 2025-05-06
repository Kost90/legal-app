import { IsString, IsEmail, Length, MaxLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @MaxLength(255, { message: 'Email must be valid and shorter than 255 characters' })
  email: string;

  @IsString()
  @Length(8, 30)
  password: string;
}
