import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { AuthorityList } from './entity/authorityList.entity';
import { Repository } from 'typeorm';
import { PowerOfAttorneyDetailsDto } from '../document/dto/create-power-of-attorney.dto';
import { DOCUMENT_TYPE } from 'src/common/constants/documents-type.enum';
import { cityMap } from './utils/cityMapper';
import { CITIES } from 'src/common/constants/city.enum';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AuthorityList)
    private readonly authorityList: Repository<AuthorityList>,
  ) {}
  public async renderPropertyPowerAttorneyTemplate(
    templateName: string,
    data: PowerOfAttorneyDetailsDto,
    documentLang: string,
  ): Promise<string> {
    const templateDir = this.configService.get<string>('templateDir');
    const filePath = path.join(process.cwd(), templateDir, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`Failed to render template ${templateName}`);
      throw new NotFoundException(`Template not found at path: ${filePath}`);
    }

    const city = this.normalizeCityName(data.propertyAddress.city);

    const authorityListForPowerOfAttorney = await this.authorityList.findOne({
      where: { document: DOCUMENT_TYPE.PAWER_OF_ATTORNEY, city: city },
    });

    if (!authorityListForPowerOfAttorney) {
      this.logger.warn(`Authoriti list not found for ${city} in db`);
      // TODO: Make here request to AI
    }

    // TODO: Make utils for adding appartment or diff lang befor number of appartment and make this all in utils
    const propertyAddress = `${data.propertyAddress.city}, ${data.propertyAddress.street}, ${data.propertyAddress.buildNumber}, ${data.propertyAddress.apartment ? data.propertyAddress.apartment : null}`;

    const updatedData = {
      ...data,
      propertyAddress,
      authoritiesList:
        documentLang === 'ua'
          ? authorityListForPowerOfAttorney.authoritiesUk
          : authorityListForPowerOfAttorney.authoritiesEn,
    };

    const templateStr = fs.readFileSync(filePath, 'utf8');

    if (!templateStr) {
      this.logger.error(`Failed to create document. Template string, by path:${filePath} not found`);
      throw new BadRequestException('Failed to create document.');
    }

    const template = Handlebars.compile(templateStr);
    return template(updatedData);
  }

  private normalizeCityName(input: string): CITIES | string {
    const key = input.trim().toLowerCase();
    return cityMap[key] || 'not found';
  }
}
