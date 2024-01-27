import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { User } from '../src/users/entities/user.entity';
import { Wish } from '../src/wishes/entities/wish.entity';
import { WishList } from '../src/wishlists/entities/wishlist.entity';
import { Offer } from '../src/offers/entities/offer.entity';

/* Валидация конфигурации и возврат опций*/
export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  try {
    await validateConfig(configService);
    return getTypeOrmOptions(configService);
  } catch (error) {
    throw error;
  }
};

/* Валидация при помощи Joi */
export const typeOrmConfigValidationSchema = Joi.object({
  DB_HOST: Joi.string().default('127.0.0.1'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('student'),
  DB_PASSWORD: Joi.string().default('student'),
  DB_NAME: Joi.string().default('kupipodariday'),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
});

const validateConfig = async (configService: ConfigService) => {
  const { error } = typeOrmConfigValidationSchema.validate(
    configService.get<object>('DB_'),
    { abortEarly: false },
  );
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
};

/* Получение опций */
const getTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [User, Wish, WishList, Offer],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
});
