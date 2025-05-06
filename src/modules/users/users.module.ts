import { Module } from '@nestjs/common';

import { UserController } from './users.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export default class UserModule {}
