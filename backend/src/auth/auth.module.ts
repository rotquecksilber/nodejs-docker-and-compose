import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { LocalGuard } from './guards/local.guard';
import { UsersService } from '../users/users.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { StringSanitizerService } from '../users/services/string-sanitizer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '10d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    LocalGuard,
    ConfigService,
    UsersService,
    BcryptService,
    StringSanitizerService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
