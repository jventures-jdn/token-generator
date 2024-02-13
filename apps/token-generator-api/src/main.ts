import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';
import { environmentConfig } from '@jventures-jdn/config-consts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* --------------------------------- Version -------------------------------- */
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  /* --------------------------------- Helmet --------------------------------- */
  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.crossOriginEmbedderPolicy());
  app.use(helmet.crossOriginOpenerPolicy());
  app.use(helmet.crossOriginResourcePolicy());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.originAgentCluster());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ErrorsInterceptor(),
  );

  /* --------------------------------- Swagger -------------------------------- */
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Token Generator API')
    .setDescription('Token Generator API Documentation.')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    origin: environmentConfig.isDevelopment
      ? ['http://localhost:3000', '*']
      : [environmentConfig.tokenGeneratorWebEndpoint],
  });

  /* --------------------------------- Listen --------------------------------- */
  await app.listen(4000);
}
bootstrap();
