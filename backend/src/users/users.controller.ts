import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { User } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { FindUsersDto } from './dto/find-users.dto';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @Get('me')
  async getMe(@Request() req: ExpressRequest) {
    const currentUser: User = req.user as User;
    return await this.usersService.getMe(currentUser.username);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('me')
  async patchMe(
    @Request() req: ExpressRequest,
    @Body() updatedUserData: UpdateUserDto,
  ): Promise<User> {
    const currentUser: User = req.user as User;
    return await this.usersService.patchMe(
      currentUser.username,
      updatedUserData,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me/wishes')
  @UsePipes(null)
  async getMyWishes(@Request() req: ExpressRequest): Promise<Wish[]> {
    const currentUser: User = req.user as User;
    return await this.usersService.getMyWishes(currentUser.username);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('find')
  async findUsers(@Body() findUsersDto: FindUsersDto): Promise<User[]> {
    return await this.usersService.findMany(findUsersDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async getUser(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string): Promise<Wish[]> {
    return await this.usersService.getUserWishes(username);
  }
}
