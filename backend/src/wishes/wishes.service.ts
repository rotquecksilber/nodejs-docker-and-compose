import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { User } from '../users/entities/user.entity';
import { ServerException } from '../errors/exceptions/server.exception';
import { ErrorCode } from '../errors/exceptions/error-codes';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  /* Найти желание по id */
  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offers')
      .where('wish.id = :id', { id })
      .getOne();

    if (!wish) {
      throw new ServerException(ErrorCode.WishNotFound);
    }

    // Уберем amount
    wish.offers.forEach((offer) => {
      if (offer.hidden) {
        offer.amount = undefined;
      }
    });

    return wish;
  }

  /* Проверить является ли пользователь владельцем желания */
  async isOwner(wishId: number, userId: number): Promise<boolean> {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (!wish) {
      throw new ServerException(ErrorCode.WishNotFound);
    }
    return wish.owner.id === userId;
  }

  /* Проверить, есть ли желающие скинуться на подарок */
  async hasContributors(wishId: number): Promise<boolean> {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (!wish) {
      throw new ServerException(ErrorCode.WishNotFound);
    }
    return wish.copied === 0;
  }

  /* Поменять raised подарка в случае offer */
  async changeWishRaised(wish: Wish, amount: number): Promise<void> {
    wish.raised = Number(wish.raised) + amount;
    await this.wishRepository.save(wish);
  }

  /* Создание желания пользователем */
  async createWish(createWishDto: CreateWishDto, user: User): Promise<Wish> {
    createWishDto.owner = user;
    return await this.wishRepository.save(createWishDto);
  }

  /* Скрываем значение amount */
  private modifyOffersBasedOnHidden(user: User, wishes: Wish[]): Wish[] {
    if (user) {
      return wishes.map((wish) => ({
        ...wish,
        offers: wish.offers.map((offer) =>
          offer.hidden ? { ...offer, amount: undefined } : offer,
        ),
      }));
    }
    return wishes;
  }

  /* Найти 40 последних желаний, offers открыты для просмотра */
  async findLatestWishes(user: User | null): Promise<Wish[]> {
    const query = this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .orderBy('wish.createdAt', 'DESC')
      .take(40);

    if (user) {
      query
        .leftJoinAndSelect('wish.offers', 'offers')
        .leftJoinAndSelect('offers.user', 'user');
    }

    let wishes = await query.getMany();
    wishes = this.modifyOffersBasedOnHidden(user, wishes);

    return wishes;
  }

  /* 20 подарков, которые копируют в свой профиль чаще всего */
  async findMostCopiedWishes(user: User | null): Promise<Wish[]> {
    const query = this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .orderBy('wish.copied', 'DESC')
      .take(20);

    if (user) {
      query
        .leftJoinAndSelect('wish.offers', 'offers')
        .leftJoinAndSelect('offers.user', 'user');
    }

    let wishes = await query.getMany();
    wishes = this.modifyOffersBasedOnHidden(user, wishes);
    return wishes;
  }

  /* Отредактировать желание */
  async updateWish(
    wishId: number,
    updateWishDto: UpdateWishDto,
    user?: User,
  ): Promise<Wish> {
    const wish: Wish = await this.findOne(wishId);

    // Можно ли редактировать
    if (!(await this.isOwner(wish.id, user.id))) {
      throw new ServerException(ErrorCode.NotTheOwner);
    }

    // Можно ли менять цену
    if (updateWishDto.price && (await this.hasContributors(wish.id))) {
      throw new ServerException(ErrorCode.CanNotChangePrice);
    }

    Object.assign(wish, updateWishDto);
    return await this.wishRepository.save(wish);
  }

  /* Удалить желание */
  async deleteWish(wishId: number, user: User): Promise<{ message: string }> {
    const wish: Wish = await this.findOne(wishId);

    // Можно ли удалять
    if (!(await this.isOwner(wish.id, user.id))) {
      throw new ServerException(ErrorCode.NotTheOwner);
    }

    await this.wishRepository.remove(wish);
    return { message: 'success' };
  }

  /* Скопировать чужое желание в себе */
  async copyWish(wishId: number, user: User): Promise<Wish> {
    const wish: Wish = await this.findOne(wishId);
    //  const user: User = await this.usersService.findByUsername(username);

    // Проверить, является ли пользователь уже владельцем желания
    if (await this.isOwner(wish.id, user.id)) {
      throw new ServerException(ErrorCode.YouAreTheOwner);
    }

    wish.copied++;
    await this.wishRepository.update(wish.id, { copied: wish.copied });

    // Создать копию желания
    const copy = new Wish();
    copy.name = wish.name;
    copy.link = wish.link;
    copy.image = wish.image;
    copy.price = wish.price;
    copy.description = wish.description;
    copy.owner = user;

    return await this.wishRepository.save(copy);
  }
}
