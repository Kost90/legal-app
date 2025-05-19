import { Exclude, Expose } from 'class-transformer';

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
}
