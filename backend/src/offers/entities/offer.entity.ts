import { Column, Entity, ManyToOne } from 'typeorm';
import { IsBoolean, IsNumber } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Offer extends BaseEntity {
  // Принадлежит одному пользователю
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  // Принадлежит одному желанию
  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  // @Transform(({ obj }) => (obj.hidden ? null : obj.amount), {
  //   toPlainOnly: true,
  // })
  @IsNumber()
  amount: number;

  @Column({ default: false })
  @IsBoolean()
  hidden: boolean;
}
