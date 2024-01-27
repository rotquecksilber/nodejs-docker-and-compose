import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from '../config/winston.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '../config/orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.testing', '.env.development', '.env'],
    }),
    WinstonModule.forRoot(createWinstonConfig()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
