import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import UserModule from '../user/users.module';
import { EmailModule } from '../email/email.module';
import { DocumentGenerationLog } from '../document/entities/document-generation.entity';

@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, DocumentGenerationLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
      }),
    }),
    UserModule,
    EmailModule,
  ],
  exports: [AuthService],
  providers: [AuthService],
})
export default class AuthModule {}
