import {
  Body,
  Request,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request as ExpressRequest } from 'express';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { Offer } from './entities/offer.entity';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createOffer(
    @Request() req: ExpressRequest,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    return await this.offersService.createOffer(
      createOfferDto,
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(@Request() req: ExpressRequest): Promise<Offer[]> {
    return await this.offersService.findAllOffers(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOfferById(@Param('id') id: number, @Request() req: ExpressRequest) {
    return await this.offersService.findOfferById(id, req.user as User);
  }
}
