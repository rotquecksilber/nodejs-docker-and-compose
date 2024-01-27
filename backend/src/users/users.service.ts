import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { ServerException } from '../errors/exceptions/server.exception';
import { ErrorCode } from '../errors/exceptions/error-codes';
import { UpdateUserDto } from './dto/update-user.dto';
import { StringSanitizerService } from './services/string-sanitizer.service';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private readonly stringSanitizerService: StringSanitizerService,
  ) {}

  /* Уникально ли имя пользователя */
  async isUsernameUnique(username: string): Promise<boolean> {
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    return !existingUsername;
  }

  /* Уникальна ли почта */
  async isEmailUnique(email: string): Promise<boolean> {
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    return !existingEmail;
  }

  /* Найти пользователя по id */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new ServerException(ErrorCode.UserNotFound);
    }
    return user;
  }

  /* Найти пользователя по username */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new ServerException(ErrorCode.UserNotFound);
    }
    return user;
  }

  /* Найти свой профиль */
  async getMe(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new ServerException(ErrorCode.UserNotFound);
    }
    return user;
  }

  /* Создание нового пользователя */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, ...rest } = createUserDto;

    // Преобразование email и username к lowercase с помощью сервиса
    const lowercaseEmail = this.stringSanitizerService.toLowerCase(email);
    const lowercaseUsername = this.stringSanitizerService.toLowerCase(username);

    // Проверим уникальность username и email
    if (!(await this.isEmailUnique(lowercaseEmail))) {
      throw new ServerException(ErrorCode.EmailTaken);
    }
    if (!(await this.isUsernameUnique(lowercaseUsername))) {
      throw new ServerException(ErrorCode.UsernameTaken);
    }

    // Хешируем пароль
    const hashedPassword = await this.bcryptService.hashPassword(password);

    const user = this.userRepository.create({
      email: lowercaseEmail,
      username: lowercaseUsername,
      ...rest,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /* Изменить данные пользователя */
  async patchMe(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findByUsername(username);

    // Хешируем пароль, если он был изменен
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hashPassword(
        updateUserDto.password,
      );
    }

    // Проверим уникальность нового username
    if (updateUserDto.username) {
      updateUserDto.username = this.stringSanitizerService.toLowerCase(
        updateUserDto.username,
      );
      if (
        !(await this.isUsernameUnique(updateUserDto.username)) &&
        updateUserDto.username !== user.username
      ) {
        throw new ServerException(ErrorCode.UsernameTaken);
      }
    }

    // Проверим уникальность нового email
    if (updateUserDto.email) {
      updateUserDto.email = this.stringSanitizerService.toLowerCase(
        updateUserDto.email,
      );
      if (
        !(await this.isEmailUnique(updateUserDto.email)) &&
        updateUserDto.email !== user.email
      ) {
        throw new ServerException(ErrorCode.EmailTaken);
      }
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  /* Получить свои желания со всеми offers */
  async getMyWishes(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { username: username },
      relations: [
        'wishes',
        'wishes.owner',
        'wishes.offers',
        'wishes.offers.user',
      ],
    });

    return user.wishes;
  }

  /* Получить желания другого пользователя */
  async getUserWishes(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { username: username },
      relations: [
        'wishes',
        'wishes.owner',
        'wishes.offers',
        'wishes.offers.user',
        'wishes.offers.item',
        'wishes.offers.item.owner',
        'wishlists',
        'wishlists.items',
        'wishlists.items.owner',
        'wishlists.owner',
      ],
    });

    // Вернем со скрытым amount
    return user.wishes.map((wish) => ({
      ...wish,
      offers: wish.offers.map((offer) =>
        offer.hidden ? { ...offer, amount: undefined } : offer,
      ),
    }));
  }

  /*
   * Найти пользователя по почте или username
   * Но у пользователя уникальные почта и username */
  async findMany(criteria: { query: string }): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :query', { query: criteria.query })
      .orWhere('user.email = :query', { query: criteria.query })
      .getMany();

    if (users.length == 0) {
      throw new ServerException(ErrorCode.UserNotFound);
    }

    return users;
  }
}
