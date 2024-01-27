import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { StringSanitizerService } from './services/string-sanitizer.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, BcryptService, StringSanitizerService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
