import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  constructor(private readonly configService: ConfigService) {}
  renderTemplate(templateName: string, data: Record<string, any>): string {
    const templateDir = this.configService.get<string>('TEMPLATE_DIR');

    const filePath = path.join(process.cwd(), templateDir, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`Failed to render template ${templateName}`);
      throw new NotFoundException(`Template not found at path: ${filePath}`);
    }

    const templateStr = fs.readFileSync(filePath, 'utf8');
    const template = Handlebars.compile(templateStr);
    return template(data);
  }
}
