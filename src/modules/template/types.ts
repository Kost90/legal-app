import { DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

export interface IPowerOfAttorneyPropertTemplateParams {
  city: string;
  date: string;
  propertyAddress: string;
  authoritiesList: string;
  fullName: string;
  birthDate: string;
  tin: string;
  address: string;
  passport: string;
  passportIssueDate: string;
  representativeName: string;
  representativeBirthDate: string;
  representativeTIN: string;
  representativeAddress: string;
  validUntil: string;
}

export interface IPowerOfAttorneyDocumentsTemplateParams {
  city: string;
  date: string;
  fullName: string;
  birthDate: string;
  taxId: string;
  address: string;
  passportIssueAuthority: string;
  passportIssueDate: string;
  representativeName: string;
  representativeBirthDate: string;
  representativeAddress: string;
  validUntil: string;
}

export interface IDocumentsInterfaces {
  [DOCUMENT_TYPE.PAWER_OF_ATTORNEY_PROPERTY]: IPowerOfAttorneyPropertTemplateParams;
  [DOCUMENT_TYPE.powerOfAttorneyDocuments]: IPowerOfAttorneyDocumentsTemplateParams;
}
