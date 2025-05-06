import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  public async getUserByEmail(email: string): Promise<Omit<User, 'passwordHash'>> {
    return this.userRepository.findOne({
      where: { email },
      select: ['createdAt', 'email', 'firstName', 'id', 'lastName', 'phone', 'updatedAt'],
    });
  }

  public async getUserPassword(id: string): Promise<{ passwordHash: string }> {
    return this.userRepository.findOne({
      where: { id },
      select: ['passwordHash'],
    });
  }

  public async createUser(password: string, user: Omit<CreateUserDto, 'password'>): Promise<User> {
    return await this.userRepository.save({ passwordHash: password, ...user });
  }
}
