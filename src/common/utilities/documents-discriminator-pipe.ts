import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { CreateDocumentDto } from 'src/modules/document/dto/create-document.dto';
import { PowerOfAttorneyDocumentsDto } from 'src/modules/document/dto/create-power-of-attorney-documents.dto';
import { PowerOfAttorneyDetailsDto } from 'src/modules/document/dto/create-power-of-attorney.dto';

@Injectable()
export class DocumentDiscriminatorPipe implements PipeTransform {
  transform(value: CreateDocumentDto) {
    const { documentType, details } = value;

    let detailsDtoClass: new () => PowerOfAttorneyDetailsDto | PowerOfAttorneyDocumentsDto;

    switch (documentType) {
      case DOCUMENT_TYPE.PAWER_OF_ATTORNEY_PROPERTY:
        detailsDtoClass = PowerOfAttorneyDetailsDto;
        break;

      case DOCUMENT_TYPE.powerOfAttorneyDocuments:
        detailsDtoClass = PowerOfAttorneyDocumentsDto;
        break;

      default:
        throw new BadRequestException(`Unsupported documentType: documentType`);
    }

    const transformedDetails = plainToInstance(detailsDtoClass, details);
    const errors = validateSync(transformedDetails, { whitelist: true });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    value.details = transformedDetails;
    return value;
  }
}
