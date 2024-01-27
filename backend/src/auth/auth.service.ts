import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ServerException } from '../errors/exceptions/server.exception';
import { ErrorCode } from '../errors/exceptions/error-codes';
import { BcryptService } from '../bcrypt/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}
  async signup(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  async auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async validatePassword(username: string, password: string) {
    // Найдем пользователя по введенному username
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new ServerException(ErrorCode.LoginOrPasswordIncorrect);
    }

    // Сравним пароли
    const isPasswordMatching = await this.bcryptService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new ServerException(ErrorCode.LoginOrPasswordIncorrect);
    }
    return user;
  }
}
