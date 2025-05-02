import { Logger, Module } from '@nestjs/common';

import { UserController } from './users.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

@Module({
  controllers: [UserController],
  imports: [Logger, TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export default class UserModule {}
