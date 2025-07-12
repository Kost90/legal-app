import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

import { TemplateService } from '../template/template.service';
import { ConfigService } from '@nestjs/config';
import { DOCUMENT_LANG } from 'src/common/constants/documents-type.enum';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { PowerOfAttorneyDetailsDto } from '../document/dto/create-power-of-attorney.dto';
import { PowerOfAttorneyDocumentsDto } from '../document/dto/create-power-of-attorney-documents.dto';

@Injectable()
export class PdfService {
  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
    private readonly puppeteerService: PuppeteerService,
  ) {}

  async generateDocumentPdf(
    templateName: string,
    data: PowerOfAttorneyDetailsDto | PowerOfAttorneyDocumentsDto,
    documentLang: DOCUMENT_LANG,
  ): Promise<{ buffer: Buffer; html: string }> {
    const [html, page] = await Promise.all([
      this.templateService.renderTemplate(templateName, data, documentLang),
      this.puppeteerService.getNewPage(),
    ]);

    try {
      await page.setContent(html, { waitUntil: 'load' });

      const buffer = await page.pdf({
        format: this.configService.get('format'),
        printBackground: this.configService.get('printBackground'),
        margin: this.configService.get('margin'),
      });
      return { buffer: Buffer.from(buffer), html: html };
    } finally {
      await page.close();
    }
  }

  private async compressPdf(buffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);
    const compressed = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(compressed);
  }
}
