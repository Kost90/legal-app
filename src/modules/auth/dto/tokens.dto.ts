import { IsString } from 'class-validator';

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
