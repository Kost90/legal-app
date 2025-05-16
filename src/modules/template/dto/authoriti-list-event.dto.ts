import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';

export class AiAuthorityListGeneratedEvent {
  constructor(
    public readonly city: string,
    public readonly lang: DOCUMENT_LANG,
    public readonly authoritiesUk: string,
    public readonly authoritiesEn: string,
    public readonly documentType: DOCUMENT_TYPE,
  ) {}
}
