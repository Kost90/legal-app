import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { AuthorityList } from './entity/authorityList.entity';
import { Repository } from 'typeorm';
import { PowerOfAttorneyDetailsDto } from '../document/dto/create-power-of-attorney.dto';
import { DOCUMENT_LANG, DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { cityMap } from './utils/cityMapper';
import { CITIES } from 'src/common/constants/city.enum';
import { FormatToString } from 'src/common/utilities/formatToString.utility';
import { IPowerOfAttorneyPropert } from './types';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AuthorityList)
    private readonly authorityListRepo: Repository<AuthorityList>,
    private readonly aiService: AiService,
  ) {}

  public async renderPropertyPowerAttorneyTemplate(
    templateName: string,
    data: PowerOfAttorneyDetailsDto,
    documentLang: DOCUMENT_LANG,
  ): Promise<string> {
    const templateStr = this.loadTemplate(templateName);
    const city = this.normalizeCityName(data.propertyAddress.city);
    const propertyAddress = FormatToString(data.propertyAddress);

    if (!propertyAddress) {
      this.logger.error('Failed to create template, property address missed');
      throw new BadRequestException('Failed to create template, property address missed');
    }

    const normalizedCity = city ? city : data.propertyAddress.city;
    const authorityList = await this.findOrGenerateAuthorityList(normalizedCity, documentLang);

    const updatedData: IPowerOfAttorneyPropert = {
      ...data,
      propertyAddress,
      authoritiesList: authorityList,
    };

    const template = Handlebars.compile(templateStr);
    return template(updatedData);
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
        where: { document: DOCUMENT_TYPE.PAWER_OF_ATTORNEY, city },
      });

      if (authority) {
        this.logger.log(`Authoriti list succsessfully founded in db`);
        return lang === DOCUMENT_LANG.UA ? authority.authoritiesUk : authority.authoritiesEn;
      }
      this.logger.warn(`Authority list not found in DB for city: ${city}. Generating via AI...`);
    }

    return await this.aiService.getAuthorityByCityForProperty(city, lang);
  }

  private normalizeCityName(input: string): CITIES {
    const normalized = cityMap[input.trim().toLowerCase()];
    if (!normalized) {
      this.logger.warn(`City normalization failed for input: ${input}`);
      return null;
    }
    return normalized;
  }
}
