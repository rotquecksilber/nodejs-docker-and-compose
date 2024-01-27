import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { Wish } from './entities/wish.entity';
import { Request as ExpressRequest } from 'express';
import { User } from '../users/entities/user.entity';
import { UpdateWishDto } from './dto/update-wish.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createWish(
    @Request() req: ExpressRequest,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    return await this.wishesService.createWish(createWishDto, req.user as User);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('last')
  async findLatestWishes(@Request() req?: ExpressRequest): Promise<Wish[]> {
    return await this.wishesService.findLatestWishes(
      (req.user as User) || null,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('top')
  async findMostCopiedWishes(@Request() req?: ExpressRequest): Promise<Wish[]> {
    return await this.wishesService.findMostCopiedWishes(
      (req.user as User) || null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wish> {
    return await this.wishesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateWish(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    return await this.wishesService.updateWish(
      id,
      updateWishDto,
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteWish(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<{ message: string }> {
    return await this.wishesService.deleteWish(id, req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id/copy')
  async copyWish(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<Wish> {
    return await this.wishesService.copyWish(id, req.user as User);
  }
}
