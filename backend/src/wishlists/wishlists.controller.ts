import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request as ExpressRequest } from 'express';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { WishList } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createWishlist(
    @Request() req: ExpressRequest,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<WishList> {
    return await this.wishlistsService.createWishlist(
      createWishlistDto,
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAllWishlists(): Promise<WishList[]> {
    return await this.wishlistsService.findAllWishlists();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findWishlistById(@Param('id') id: number) {
    return await this.wishlistsService.findWishlistById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateWishlist(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Request() req: ExpressRequest,
  ): Promise<WishList> {
    return await this.wishlistsService.updateWishlist(
      id,
      updateWishlistDto,
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteWishlist(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<{ message: string }> {
    return await this.wishlistsService.deleteWishlist(id, req.user as User);
  }
}
