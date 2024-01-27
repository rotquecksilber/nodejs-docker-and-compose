import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { IsBoolean, IsNumber } from 'class-validator';

export class CreateOfferDto {
  user: User;

  item: Wish;

  @IsNumber()
  amount: number;

  @IsBoolean()
  hidden: boolean;

  @IsNumber()
  itemId: number;
}
