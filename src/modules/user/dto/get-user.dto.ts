import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { DocumentResponseDto } from 'src/modules/document/dto/document-response.dto';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  @Type(() => DocumentResponseDto)
  @IsOptional()
  documents?: DocumentResponseDto[];
}
