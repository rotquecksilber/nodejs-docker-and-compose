import { Column, Entity, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { WishList } from '../../wishlists/entities/wishlist.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  private static defaultAbout = 'Пока ничего не рассказал о себе';
  private static defaultAvatar = 'https://i.pravatar.cc/300';

  @Column({ length: 30, unique: true })
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  username: string;

  @Column({ default: User.defaultAbout, length: 200 })
  @IsString()
  @Length(2, 200)
  about: string;

  @Column({ default: User.defaultAvatar })
  @IsString()
  @IsUrl()
  avatar: string;

  @Column({ unique: true })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Exclude()
  @Expose({ groups: ['me'] })
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @Exclude()
  password: string;

  // Имеет много желаний
  @OneToMany(() => Wish, (wishes) => wishes.owner)
  wishes: Wish[];

  // Может создавать много оферов
  @OneToMany(() => Offer, (offers) => offers.user)
  offers: Offer[]; //here

  // Может иметь много списков желаний
  @OneToMany(() => WishList, (wishlists) => wishlists.owner)
  wishlists: WishList[];
}
