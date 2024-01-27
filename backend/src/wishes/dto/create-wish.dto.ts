import { IsNotEmpty, IsNumber, IsString, IsUrl, Length } from 'class-validator';
import { User } from '../../users/entities/user.entity';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;

  owner: User;
}
