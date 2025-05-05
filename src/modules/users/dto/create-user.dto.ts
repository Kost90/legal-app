import { IsString, IsEmail, Length, Matches, IsOptional, MaxLength } from 'class-validator';
import { REGEXES } from 'src/common/constants/regex';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  firstName: string;

  @IsString()
  @Length(2, 30)
  lastName: string;

  @IsEmail()
  @MaxLength(255, { message: 'Email must be valid and shorter than 255 characters' })
  email: string;

  @IsString()
  @Length(8, 30)
  @Matches(REGEXES.PASSWORD, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
