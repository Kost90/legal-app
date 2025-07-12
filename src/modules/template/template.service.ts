import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';

import { AuthorityList } from './entity/authorityList.entity';
import { Repository } from 'typeorm';
import { PowerOfAttorneyDetailsDto } from '../document/dto/create-power-of-attorney.dto';
import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { cityMap } from './utils/cityMapper';
import { CITIES } from 'src/common/constants/city.enum';
import { FormatToString } from 'src/common/utilities/formatToString.utility';
import { IPowerOfAttorneyDocumentsTemplateParams, IPowerOfAttorneyPropertTemplateParams } from './types';
import { AiService } from '../ai/ai.service';
import { AiAuthorityListGeneratedEvent } from './dto/authoriti-list-event.dto';
import { EventService } from '../event/event.service';
import { messages } from '../event/messages/messages';
import { formatDateByLang } from 'src/common/utilities/date-formatter.utility';
import { PowerOfAttorneyDocumentsDto } from '../document/dto/create-power-of-attorney-documents.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AuthorityList)
    private readonly authorityListRepo: Repository<AuthorityList>,
    private readonly aiService: AiService,
    private readonly eventService: EventService,
  ) {}

  public async renderTemplate<T extends DOCUMENT_TYPE>(
    templateName: string,
    data: T extends DOCUMENT_TYPE.PAWER_OF_ATTORNEY_PROPERTY ? PowerOfAttorneyDetailsDto : PowerOfAttorneyDocumentsDto,
    documentLang: DOCUMENT_LANG,
  ): Promise<string> {
    const templateStr = this.loadTemplate(templateName);

    let city: string;
    let propertyAddress: string;
    let normalizedCity: string;
    let authorityList: string;

    if (this.isPowerOfAttorneyProperty(data)) {
      if (data.propertyAddress?.city) {
        city = this.normalizeCityName(data.propertyAddress.city);
        normalizedCity = city || data.propertyAddress.city;
      }
      propertyAddress = FormatToString(data.propertyAddress);
      authorityList = await this.findOrGenerateAuthorityList(normalizedCity, documentLang);

      const updatedData: IPowerOfAttorneyPropertTemplateParams = {
        ...data,
        birthDate: formatDateByLang(data.birthDate, documentLang),
        representativeBirthDate: formatDateByLang(data.representativeBirthDate, documentLang),
        date: formatDateByLang(data.date, documentLang),
        passportIssueDate: formatDateByLang(data.passportIssueDate, documentLang),
        validUntil: formatDateByLang(data.validUntil, documentLang),
        propertyAddress,
        authoritiesList: authorityList,
      };

      return Handlebars.compile(templateStr)(updatedData);
    }

    if (this.isPowerOfAttorneyDocuments(data)) {
      const updatedData: IPowerOfAttorneyDocumentsTemplateParams = {
        ...data,
        birthDate: formatDateByLang(data.birthDate, documentLang),
        representativeBirthDate: formatDateByLang(data.representativeBirthDate, documentLang),
        date: formatDateByLang(data.date, documentLang),
        passportIssueDate: formatDateByLang(data.passportIssueDate, documentLang),
        validUntil: formatDateByLang(data.validUntil, documentLang),
      };
      return Handlebars.compile(templateStr)(updatedData);
    }

    throw new NotFoundException('Document type template noy found');
  }

  private loadTemplate(templateName: string): string {
    const templateDir = this.configService.get<string>('templateDir');
    const filePath = path.join(process.cwd(), templateDir, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`Template not found: ${filePath}`);
      throw new NotFoundException(`Template not found at path: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    if (!content) {
      this.logger.error(`Template content is empty: ${filePath}`);
      throw new BadRequestException('Template file is empty.');
    }

    return content;
  }

  private async findOrGenerateAuthorityList(city: string, lang: DOCUMENT_LANG): Promise<string> {
    if (city) {
      const authority = await this.authorityListRepo.findOne({
        where: { document: DOCUMENT_TYPE.PAWER_OF_ATTORNEY_PROPERTY, city },
      });

      if (authority) {
        this.logger.log(`Authoriti list succsessfully founded in db`);
        return lang === DOCUMENT_LANG.UA ? authority.authoritiesUk : authority.authoritiesEn;
      }
      this.logger.warn(`Authority list not found in DB for city: ${city}. Generating via AI...`);
    }

    const aiGeneratedList = await this.aiService.getAuthorityByCityForProperty(city, lang);

    if (aiGeneratedList && city) {
      const event = new AiAuthorityListGeneratedEvent(
        city,
        lang,
        aiGeneratedList.uk,
        aiGeneratedList.en,
        DOCUMENT_TYPE.PAWER_OF_ATTORNEY_PROPERTY,
      );
      this.eventService.onGeneratedAuthoritySave(event);
      this.logger.log(`Emitted ai.authority_list.generated event for city: ${city}`);
    }

    return lang === DOCUMENT_LANG.UA ? aiGeneratedList.uk : aiGeneratedList.en;
  }

  private normalizeCityName(input: string): CITIES {
    const normalized = cityMap[input.trim().toLowerCase()];
    if (!normalized) {
      this.logger.warn(`City normalization failed for input: ${input}`);
      return null;
    }
    return normalized;
  }

  @OnEvent(messages.SAVE_GENERATED_AUTHORITY)
  async handleAiAuthorityListGenerated(payload: AiAuthorityListGeneratedEvent) {
    this.logger.log(
      `Handling ai.authority_list.generated event for city: ${payload.city}, type: ${payload.documentType}`,
    );
    try {
      let authorityEntry = await this.authorityListRepo.findOne({
        where: { city: payload.city, document: payload.documentType },
      });

      if (!authorityEntry) {
        authorityEntry = this.authorityListRepo.create({
          city: payload.city,
          document: payload.documentType,
          authoritiesUk: payload.authoritiesUk,
          authoritiesEn: payload.authoritiesEn,
        });
        this.logger.log(`Creating new AuthorityList entry for city: ${payload.city}, type: ${payload.documentType}`);
      }

      await this.authorityListRepo.save(authorityEntry);
      this.logger.log(
        `Successfully saved/updated AI-generated authority list for city: ${payload.city}, lang: ${payload.lang}, type: ${payload.documentType}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save AI-generated authority list for city: ${payload.city} from event. Error:`,
        error,
      );
    }
  }

  private isPowerOfAttorneyProperty(
    data: PowerOfAttorneyDetailsDto | PowerOfAttorneyDocumentsDto,
  ): data is PowerOfAttorneyDetailsDto {
    return 'propertyAddress' in data;
  }

  private isPowerOfAttorneyDocuments(
    data: PowerOfAttorneyDetailsDto | PowerOfAttorneyDocumentsDto,
  ): data is PowerOfAttorneyDetailsDto {
    return !('propertyAddress' in data) || data.propertyAddress === undefined || data.propertyAddress === null;
  }
}
