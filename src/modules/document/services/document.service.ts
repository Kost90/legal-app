import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Document } from '../entities/document.entity';
import { Repository } from 'typeorm';
import { PdfService } from 'src/modules/pdf/pdf.service';
import { CreatePowerOfAttorneyDto } from '../dto/create-power-of-attorney.dto';
import { StorageService } from 'src/modules/storage/storage.service';
import { DocumentType } from 'src/modules/documentType/entities/document-type.entity';
import { DocumentGenerationLog } from '../entities/document-generation.entity';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly FREE_GENERATION_COOLDOWN_DAYS = 3;
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    @InjectRepository(DocumentGenerationLog)
    private readonly documentGenerationLogRepository: Repository<DocumentGenerationLog>,
  ) {}

  public async createPowerOfAttorneyPropertyDocument(
    body: CreatePowerOfAttorneyDto,
    userId?: string,
  ): Promise<StreamableFile> {
    const { isPaid, email } = body;
    const canGenerateFree = await this.canGenerateDocumentForFree(email, isPaid);

    if (!canGenerateFree) {
      this.logger.warn(`Limit free generation for email: ${email}`);
      throw new ForbiddenException(
        `Безкоштовна генерація буде доступна пізніше. Для платної генерації, будь ласка, сплатіть послугу.`,
      );
    }

    const templateName = `${body.documentType}.${body.documentLang}`;
    const pdf = await this.pdfService.generatePwoerOfAttorneyPropertyPdf(templateName, body.details, body.documentLang);

    if (!pdf) {
      this.logger.error(`Failed to create pdf ${templateName} for email ${email}`);
      throw new BadRequestException(`Failed to create pdf.`);
    }

    const fileKey = `${templateName}.${body.details.fullName}.${uuidv4()}`.trim();

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

    const [document] = await Promise.all([this.documentRepository.save(newDocument), this.recordFreeGeneration(email)]);

    if (!document) {
      this.logger.error(`Failed to save document to the db ${fileKey}`);
      throw new BadRequestException(`Failed to save document.`);
    }

    this.logger.log(`Document ${fileKey} created succsessfully`);
    return new StreamableFile(pdf);
  }

  private async canGenerateDocumentForFree(email: string, isPaid: boolean): Promise<boolean> {
    if (isPaid) {
      return true;
    }

    const logEntry = await this.documentGenerationLogRepository.findOne({ where: { email } });

    if (!logEntry.isVerified) {
      throw new BadRequestException('You need to verify email');
    }

    if (logEntry.isVerified && !logEntry.lastFreeGenerationAt) {
      return true;
    }

    if (logEntry.isVerified && logEntry.lastFreeGenerationAt) {
      const now = new Date();
      const lastGenerationDate = new Date(logEntry.lastFreeGenerationAt);
      const cooldownPeriod = this.FREE_GENERATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

      if (now.getTime() - lastGenerationDate.getTime() > cooldownPeriod) {
        return true;
      }
    }

    return false;
  }

  private async recordFreeGeneration(email: string): Promise<void> {
    const logEntry = await this.documentGenerationLogRepository.findOne({ where: { email } });

    if (logEntry) {
      logEntry.lastFreeGenerationAt = new Date();
      await this.documentGenerationLogRepository.save(logEntry);
    } else {
      await this.documentGenerationLogRepository.save({
        email,
        lastFreeGenerationAt: new Date(),
      });
    }
  }
}
