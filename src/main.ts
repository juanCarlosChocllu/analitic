import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  port,
  interfaceRed,
  frontend1,
  frontend2,
} from './core/config/variables.entorno.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [frontend1, frontend2],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (e) => {
        const error = e.map((error) => {
          if (
            Object.values(error.children).map((e) => e.constraints).length > 0
          ) {
            const data = Object.values(error.children).map((e) => e.children);
            return {
              propiedad: data[0][0].property,
              error: Object.values(data[0][0].constraints),
            };
          }

          return {
            propiedad: error.property,
            error: Object.values(error.constraints),
          };
        });
        throw new BadRequestException(error);
      },
    }),
  );

  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(port, interfaceRed, () => {
    console.log(`Servidor corriendo  host:${interfaceRed}:${port}`);
  });
}

bootstrap();
