import { BadRequestException, Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Document } from '../entities/document.entity';
import { Repository } from 'typeorm';
import { PdfService } from 'src/modules/pdf/pdf.service';
import { CreatePowerOfAttorneyDto } from '../dto/create-power-of-attorney.dto';
import { StorageService } from 'src/modules/storage/storage.service';
import { DocumentType } from 'src/modules/documentType/entities/document-type.entity';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
  ) {}

  public async createPowerOfAttorneyPropertyDocument(
    body: CreatePowerOfAttorneyDto,
    userId?: string,
  ): Promise<StreamableFile> {
    const templateName = `${body.documentType}.${body.documentLang}`;
    const pdf = await this.pdfService.generatePwoerOfAttorneyPropertyPdf(templateName, body.details, body.documentLang);

    if (!pdf) {
      this.logger.error(`Can't create pdf ${templateName}`);
      throw new BadRequestException(`Failed to create pdf.`);
    }

    const fileKey = `${templateName}.${body.details.fullName}.${body.details.tin}`.trim();

    const storedFile = await this.storageService.uploadFile(fileKey, pdf, 'application/pdf');

    if (!storedFile) {
      this.logger.error(`Failed to save file to the bucket ${fileKey}`);
      throw new BadRequestException(`Failed to save pdf.`);
    }

    const documentTypeId = await this.documentTypeRepository.findOne({ where: { name: body.documentType } });

    if (!documentTypeId) {
      throw new NotFoundException(`Document type ${body.documentType} not found`);
    }

    // TODO: or change to find user, before save
    const newDocument = this.documentRepository.create({
      fileKey,
      documentType: documentTypeId,
      user: userId ? { id: userId } : null,
    });

    const document = await this.documentRepository.save(newDocument);

    if (!document) {
      this.logger.error(`Failed to save document to the db ${fileKey}`);
      throw new BadRequestException(`Failed to save document.`);
    }

    return new StreamableFile(pdf);
  }
}
