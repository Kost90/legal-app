import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
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
import { DocumentGenerationLog } from '../entities/document-generation.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { DocumentResponseDto } from '../dto/document-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiPaginatedResponseDTO, SuccessResponseDTO } from 'src/common/dto/succsess-response.dto';
import { PaginationQueryParams, SortQueryParams } from 'src/common/validations/pagination-query.dto';
import { SortType } from 'src/common/constants/pagination-enum';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly FREE_GENERATION_COOLDOWN_DAYS = 3;
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    @InjectRepository(DocumentGenerationLog)
    private readonly documentGenerationLogRepository: Repository<DocumentGenerationLog>,
    private readonly userService: UserService,
  ) {}

  public async createPowerOfAttorneyDocument(
    body: CreatePowerOfAttorneyDto,
    userId?: string,
  ): Promise<{ html: string; url: string }> {
    const { isPaid, email } = body;
    const canGenerateFree = await this.canGenerateDocumentForFree(email, isPaid);

    if (!canGenerateFree) {
      this.logger.warn(`Limit free generation for email: ${email}`);
      throw new ForbiddenException(
        `Безкоштовна генерація буде доступна пізніше. Для платної генерації, будь ласка, сплатіть послугу.`,
      );
    }

    const templateName = `${body.documentType}.${body.documentLang}`;
    const { buffer: pdf, html } = await this.pdfService.generatePwoerOfAttorneyPropertyPdf(
      templateName,
      body.details,
      body.documentLang,
    );
    if (!pdf || !html) {
      this.logger.error(`Failed to create pdf ${templateName} for email ${email}`);
      throw new BadRequestException(`Failed to create pdf.`);
    }

    const fileKey = `${templateName}.${body.details.fullName}.${uuidv4()}`.trim();

    const storedFile = await this.storageService.uploadFile(fileKey, pdf, 'application/pdf');

    if (!storedFile) {
      this.logger.error(`Failed to save file to the bucket ${fileKey}`);
      throw new BadRequestException(`Failed to save pdf.`);
    }

    const user = userId ? await this.userService.findUserById(userId) : null;

    const newDocument = this.documentRepository.create({
      fileKey,
      type: body.documentType,
      lang: body.documentLang,
      isPaid: body.isPaid ? body.isPaid : false,
      user,
    });

    const [document] = await Promise.all([this.documentRepository.save(newDocument), this.recordFreeGeneration(email)]);

    if (!document) {
      this.logger.error(`Failed to save document to the db ${fileKey}`);
      throw new BadRequestException(`Failed to save document.`);
    }
    const { data } = await this.getDocumentPresignedUrl(document.id, userId);
    this.logger.log(`Document ${fileKey} created succsessfully`);
    return { html: html, url: data };
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

  public async getUserDocumentsByType(
    userId: string,
    documentType: string,
    documentLang?: string,
    paginationParams?: PaginationQueryParams,
    sortQueryParams?: SortQueryParams,
  ): Promise<ApiPaginatedResponseDTO<DocumentResponseDto>> {
    const page = paginationParams.page ?? 1;
    const limit = paginationParams.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortType = sortQueryParams.sortType ?? 'DESC';

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoin('document.user', 'user')
      .where('user.id = :userId', { userId });

    if (documentType) {
      queryBuilder.andWhere('document.type = :documentType', { documentType });
    }

    if (documentLang) {
      queryBuilder.andWhere('document.lang = :documentLang', { documentLang });
    }

    if (sortType) {
      queryBuilder.orderBy('document.createdAt', sortType as SortType);
    }

    const [items, totalResult] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(totalResult / limit);

    if (!items.length) {
      throw new NotFoundException('User documents not found');
    }

    return {
      data: {
        items: plainToInstance(DocumentResponseDto, items, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          currentPage: page,
          totalPages,
          totalResult,
        },
      },
      message: 'User documents fetched succsessfully',
      statusCode: HttpStatus.OK,
    };
  }

  public async downloadUserDocument(documentId: string, userId: string): Promise<StreamableFile> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with Id: ${userId}, not found`);
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document) {
      throw new NotFoundException(`Document with Id: ${documentId}, not found`);
    }

    if (document.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this document');
    }

    const fileBuffer = await this.storageService.downloadFile(document.fileKey);
    this.logger.log(`User ${userId} downloaded document ${documentId}`);

    return new StreamableFile(fileBuffer);
  }

  public async getDocumentPresignedUrl(documentId: string, userId: string): Promise<SuccessResponseDTO<string>> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with Id: ${userId}, not found`);
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });
    if (!document || document.user.id !== user.id) {
      throw new NotFoundException('Document not found or access denied');
    }

    const url = await this.storageService.getPresignedUrl(document.fileKey);

    return { data: url, message: 'Presigned url fetched succsessfulle', statusCode: HttpStatus.OK };
  }

  public async removeDocument(documentId: string, userId: string): Promise<SuccessResponseDTO<string>> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with Id: ${userId} not found`);
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document) {
      throw new NotFoundException(`Document with Id: ${documentId} not found`);
    }

    if (document.user.id !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this document');
    }

    try {
      await Promise.all([this.storageService.deleteFile(document.fileKey), this.documentRepository.delete(documentId)]);
      this.logger.log(`User ${user.id} deleted document ${documentId}`);
      return {
        data: 'document deleted succsessfully',
        message: 'document deleted succsessfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId}`, error);
      throw new BadRequestException('Failed to delete document');
    }
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
