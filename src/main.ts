import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const env = app.get(ConfigService);
  const port = env.get<number>('PORT') || 3000;
  const node_env = env.get<string>('NODE_ENV') || 'development';
  app.useGlobalPipes(new ValidationPipe());

  if (node_env === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Test Cloudinary API')
      .setDescription(
        'HTTP API (Swagger UI is enabled when development mode is enabled)',
      )
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
  }

  await app
    .listen(port)
    .then(() => {
      logger.log(`Server is running on port ${port}`);
      if (node_env === 'development') {
        logger.verbose(`Swagger: http://localhost:${port}/swagger`);
      }
    })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}
void bootstrap();
