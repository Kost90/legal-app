import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import multipart from '@fastify/multipart';
import * as path from 'path';
import fastifyStatic from '@fastify/static';
import { HttpAdapterHost } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response-interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.register(multipart);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
  });

  await app.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/static/',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new ResponseInterceptor());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(process.env.PORT || 3030, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
