// import { Exclude, Expose } from 'class-transformer';

// @Exclude()
// export class DocumentResponseDto {
//   @Expose()
//   id: string;

//   @Expose()
//   fileKey: string;

//   @Expose()
//   isPaid: boolean;

//   @Expose()
//   expiredAt: string | null;
// }

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
export class DocumentTypeDto {
  @Expose()
  name: string;

  @Expose()
  description: string;
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
  @Type(() => UserInfoDto)
  user?: UserInfoDto;

  @Expose()
  @Type(() => DocumentTypeDto)
  documentType?: DocumentTypeDto;
}
