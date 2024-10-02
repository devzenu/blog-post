import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Nestjs Masterclass -Blog app API')
    .setDescription('Use the base API URL as http://localhost:8000')
    .setTermsOfService('http://localhost:8000/terms-of-service ')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
    )
    .addServer('http://localhost:8000')
    .setVersion('1.0')
    .build();
  //instantiate document object
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // our nest js swagger docs ready for use

  await app.listen(8000);
}
bootstrap();
