import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

import { TemplateService } from '../template/template.service';
import { PowerOfAttorneyDetailsDto } from '../document/dto/create-power-of-attorney.dto';

@Injectable()
export class PdfService {
  constructor(private readonly templateService: TemplateService) {}

  async generatePwoerOfAttorneyPropertyPdf(
    templateName: string,
    data: PowerOfAttorneyDetailsDto,
    documentLang: string,
  ): Promise<Buffer> {
    const [html, browser] = await Promise.all([
      this.templateService.renderPropertyPowerAttorneyTemplate(templateName, data, documentLang),
      puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }),
    ]);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // TODO: Make pdf options in config
      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });

      return await this.compressPdf(Buffer.from(buffer));
    } finally {
      await browser.close();
    }
  }

  private async compressPdf(buffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);
    const compressed = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(compressed);
  }
}
