import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const env = process.env.NODE_ENV || 'development';
  app.useGlobalPipes(new ValidationPipe());

  if (env === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('test-cloudinary API')
      .setDescription(
        'HTTP API (Swagger UI is enabled when NODE_ENV=development)',
      )
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
    logger.log(`Swagger: http://localhost:${port}/swagger`);
  }

  await app
    .listen(port)
    .then(() => {
      logger.log(`Server is running on port ${port}`);
    })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}
void bootstrap();
