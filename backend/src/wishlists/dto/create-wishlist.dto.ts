import { Wish } from '../../wishes/entities/wish.entity';
import { User } from '../../users/entities/user.entity';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  owner: User;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  name?: string;

  @IsString()
  @Length(1, 1024)
  @IsOptional()
  description?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsInt({ each: true })
  itemsId: number[];

  items: Wish[];
}
