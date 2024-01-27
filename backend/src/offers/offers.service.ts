import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from '../wishes/wishes.service';
import { ServerException } from '../errors/exceptions/server.exception';
import { ErrorCode } from '../errors/exceptions/error-codes';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishService: WishesService,
  ) {}

  /* Amount больше price? */
  async isAmountMoreThenPrice(
    wishId: number,
    amount: number,
  ): Promise<boolean> {
    const wish: Wish = await this.wishService.findOne(wishId);
    return amount > Number(wish.price);
  }

  /* Проверить собрана ли уже сумма на подарок */
  async isAmountReached(wishId: number): Promise<boolean> {
    const wish: Wish = await this.wishService.findOne(wishId);
    return Number(wish.raised) >= Number(wish.price);
  }

  /* Создать предложение */
  async createOffer(
    createOfferDto: CreateOfferDto,
    user: User,
  ): Promise<Offer> {
    const { amount, itemId } = createOfferDto;
    const wish: Wish = await this.wishService.findOne(itemId);

    // Проверим не собрана ли уже необходимая сумма
    if (await this.isAmountReached(itemId)) {
      throw new ServerException(ErrorCode.PriceIsRiched);
    }
    // Проверим amount > price
    if (await this.isAmountMoreThenPrice(itemId, amount)) {
      throw new ServerException(ErrorCode.AmountMoreThenPrice);
    }
    // Проверим, является ли пользователь владельцем желания
    if (await this.wishService.isOwner(itemId, user.id)) {
      throw new ServerException(ErrorCode.YouAreTheOwnerOffer);
    }

    const newOffer = {
      ...createOfferDto,
      user,
      item: wish,
    };

    await this.wishService.changeWishRaised(wish, amount);
    return await this.offerRepository.save(newOffer);
  }

  /* Найти все offers */
  async findAllOffers(user: User): Promise<Offer[]> {
    let offers = await this.offerRepository.find({
      relations: [
        'item',
        'item.owner',
        'user',
        'user.wishes',
        'user.wishes.owner',
        'user.offers',
        'user.offers.item',
        'user.offers.user',
        'user.wishlists',
        'user.wishlists.owner',
        'user.wishlists.items',
      ],
    });

    offers = offers.map((offer) => {
      if (offer.hidden && offer.item.owner.id !== user.id) {
        return { ...offer, amount: undefined };
      }
      return offer;
    });

    return offers;
  }

  /* Получить offer по id, если он не hidden */
  async findOfferById(id: number, user: User): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: id },
      relations: [
        'item',
        'item.owner',
        'user',
        'user.wishes',
        'user.wishes.owner',
        'user.offers',
        'user.offers.item',
        'user.wishlists',
        'user.wishlists.owner',
        'user.wishlists.items',
      ],
    });

    if (!offer) {
      throw new ServerException(ErrorCode.NoOffer);
    }

    // Если предложение скрыто и пользователь не является владельцем, то скрываем поле 'amount'
    if (offer.hidden && offer.user.id !== user.id) {
      return { ...offer, amount: undefined };
    }

    // Иначе возвращаем предложение без изменений
    return offer;
  }
}
