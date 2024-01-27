import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WishList } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';
import { ServerException } from '../errors/exceptions/server.exception';
import { ErrorCode } from '../errors/exceptions/error-codes';
import { Wish } from '../wishes/entities/wish.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishList)
    private readonly wishlistRepository: Repository<WishList>,
    private readonly wishesService: WishesService,
  ) {}

  /* Добавить предметы в список желаний */
  private async addItemsToWishlist(
    user: User,
    dto: CreateWishlistDto | UpdateWishlistDto,
  ) {
    for (const itemId of dto.itemsId) {
      const wish: Wish = await this.wishesService.findOne(itemId);

      if (!(await this.wishesService.isOwner(itemId, user.id))) {
        throw new ServerException(ErrorCode.FirstCopyTheWish);
      }

      dto.items.push(wish);
    }
  }

  /* Создать список желаний */
  async createWishlist(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<WishList> {
    createWishlistDto.owner = user;
    createWishlistDto.items = [];

    // Добавим желания
    await this.addItemsToWishlist(user, createWishlistDto);

    return this.wishlistRepository.save(createWishlistDto);
  }

  /* Найдем все wishlists */
  async findAllWishlists(): Promise<WishList[]> {
    return this.wishlistRepository.find({
      relations: ['items', 'owner'],
    });
  }

  /* Найдем wishlist по id */
  async findWishlistById(id: number): Promise<WishList> {
    const wishlist: Promise<WishList> = this.wishlistRepository.findOne({
      where: { id: id },
      relations: ['items', 'owner'],
    });
    if (!wishlist) {
      throw new ServerException(ErrorCode.WishListNotFound);
    }
    return wishlist;
  }

  /* Проверим, является ли пользователь владельцем wishlist */
  async isOwner(wishlistId: number, userId: number): Promise<boolean> {
    const wishlist: WishList = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['owner'],
    });
    if (!wishlist) {
      throw new ServerException(ErrorCode.WishListNotFound);
    }
    return wishlist.owner.id === userId;
  }

  /* Изменить wishlist */
  async updateWishlist(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ): Promise<WishList> {
    const wishlist: WishList = await this.findWishlistById(id);

    // Проверим владельца
    if (!(await this.isOwner(wishlist.id, user.id))) {
      throw new ServerException(ErrorCode.WishlistNotOwned);
    }

    // itemsId
    if (updateWishlistDto.itemsId) {
      updateWishlistDto.items = [];
      await this.addItemsToWishlist(user, updateWishlistDto);
    }

    Object.assign(wishlist, updateWishlistDto);
    return this.wishlistRepository.save(wishlist);
  }

  /* Удалить wishlist */
  async deleteWishlist(id: number, user: User): Promise<{ message: string }> {
    const wishlist: WishList = await this.findWishlistById(id);

    // Проверим владельца
    if (!(await this.isOwner(wishlist.id, user.id))) {
      throw new ServerException(ErrorCode.WishlistNotOwned);
    }

    await this.wishlistRepository.remove(wishlist);
    return { message: 'success' };
  }
}
