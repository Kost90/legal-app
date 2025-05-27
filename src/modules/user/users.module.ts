import { forwardRef, Module } from '@nestjs/common';

import { UserController } from './users.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import DocumentModule from '../document/documents.module';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => DocumentModule)],
  providers: [UserService],
  exports: [UserService],
})
export default class UserModule {}
