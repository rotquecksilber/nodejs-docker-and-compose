import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsInt, IsNumber, IsString, IsUrl, Length } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';

@Entity()
export class Wish extends BaseEntity {
  @Column({ length: 250 })
  @IsString()
  @Length(1, 250)
  name: string;

  @Column()
  @IsString()
  @IsUrl()
  link: string;

  @Column()
  @IsString()
  @IsUrl()
  image: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @IsNumber()
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  raised: number;

  // Принадлежит одному пользователю
  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column({ length: 1024 })
  @IsString()
  @Length(1, 1024)
  description: string;

  // Имеет много оферов
  @OneToMany(() => Offer, (offers) => offers.item)
  offers: Offer[];

  @Column({ default: 0 })
  @IsInt()
  copied: number;
}
