import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class WishList extends BaseEntity {
  // Принадлежит одному пользователю
  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  @Column({ length: 250, default: 'Мой список' })
  @IsString()
  @Length(1, 250)
  @IsOptional()
  name: string;

  @Column({
    length: 1500,
    default: 'Здесь вы можете объединить свою желания в группу',
  })
  @IsString()
  @Length(1, 1500)
  description: string;

  @Column()
  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  // Включает в себя много желаний
  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}
