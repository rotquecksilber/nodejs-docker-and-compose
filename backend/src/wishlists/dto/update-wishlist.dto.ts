import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';

export class UpdateWishlistDto {
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
