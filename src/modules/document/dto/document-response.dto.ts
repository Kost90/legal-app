import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserInfoDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;
}

@Exclude()
export class DocumentResponseDto {
  @Expose()
  id: string;

  @Expose()
  fileKey: string;

  @Expose()
  isPaid: boolean;

  @Expose()
  expiredAt: string | null;

  @Expose()
  lang: string;

  @Expose()
  type: string;

  @Expose()
  @Type(() => UserInfoDto)
  user?: UserInfoDto;
}
