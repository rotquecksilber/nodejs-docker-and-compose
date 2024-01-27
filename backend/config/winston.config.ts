import * as winston from 'winston';
import TelegramLogger from 'winston-telegram';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
export const createWinstonConfig = () => ({
  levels: {
    critical_error: 0,
    error: 1,
    special_warning: 2,
    another_log_level: 3,
    info: 4,
  },
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({
      filename: 'all-messages.log',
      level: 'info',
    }),
    new TelegramLogger({
      level: 'error',
      token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      chatId: configService.get<number>('TELEGRAM_CHAT_ID'),
    }),
  ],
});
