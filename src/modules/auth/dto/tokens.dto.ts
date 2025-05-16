import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TokensDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  actionToken: string;
}

export class RefreshTokenDto {
  @IsString()
  token: string;
}

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
