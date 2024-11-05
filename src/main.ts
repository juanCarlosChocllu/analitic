import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { port , interfaceRed} from './config/variables.entorno.config';

async function bootstrap() {

  
  const app = await NestFactory.create(AppModule);
 
  
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      exceptionFactory:(e)=>{
        const error= e.map((error)=>{
          return {
            propiedad :error.property,
            error :Object.values(error.constraints)
          }
        })
       throw new BadRequestException(error)
    }
    })
);
   app.setGlobalPrefix('api')
   
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(port,interfaceRed, () => {
    console.log(`Servidor corriendo  host:${interfaceRed}:${port}`);
  });
}

bootstrap();
