import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';

import { ServerExceptionFilter } from './errors/filters/server-exception.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { nestCsrf } from 'ncsrf/dist';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.use(nestCsrf());

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ServerExceptionFilter());
  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error('Error occurred during bootstrap:', err);
});
