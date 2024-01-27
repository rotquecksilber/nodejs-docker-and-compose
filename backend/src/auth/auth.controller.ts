import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LocalGuard } from './guards/local.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Request } from '@nestjs/common';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }
  @UseGuards(LocalGuard)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Req() req: Request & { user: User }) {
    return this.authService.auth(req.user);
  }
}
