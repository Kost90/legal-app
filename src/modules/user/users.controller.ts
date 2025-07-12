import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { getUserDecorator } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentService } from '../document/services/document.service';
import { GetDocumentRequestDto } from '../document/dto/get-documents.dto';
import { CreateDocumentDto } from '../document/dto/create-document.dto';
import { DocumentDiscriminatorPipe } from 'src/common/utilities/documents-discriminator-pipe';

// TODO: Think about normalize endpoint
// @UseGuards(ApiKeyAuthGuard)
// @UseGuards(JwtAuthGuard)
@Controller(CONTROLLERS.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @UseGuards(ApiKeyAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@getUserDecorator() user: { id: string; email: string }) {
    return this.userService.getUserInformation(user.id);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('me/:userId')
  getUserInformation(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.userService.getUserInformation(userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Post('create-power-of-attorney/:userId')
  @Header('Content-Type', 'application/json')
  async createDocument(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body(DocumentDiscriminatorPipe) body: CreateDocumentDto,
  ) {
    return this.documentService.createDocument(body, userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('user-documents/:userId')
  getUserDocuments(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query(new ValidationPipe({ transform: true })) query: GetDocumentRequestDto,
  ) {
    return this.documentService.getUserDocumentsByType(
      userId,
      query?.documentType,
      query?.documentLang,
      {
        page: query?.page,
        limit: query?.limit,
      },
      {
        sortKey: query?.sortKey,
        sortType: query?.sortType,
      },
    );
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('download-user-document/user/:userId/document/:documentId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async downloadDocument(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentService.downloadUserDocument(documentId, userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('download-user-presigned-document/user/:userId/document/:documentId')
  async downloadDocumentPresigned(
    @Param('documentId') documentId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return await this.documentService.getDocumentPresignedUrl(documentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-document/:documentId')
  async deleteDocument(@Param('documentId') documentId: string, @getUserDecorator() user: { id: string }) {
    return await this.documentService.removeDocument(documentId, user.id);
  }
}
