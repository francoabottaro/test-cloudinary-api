import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'nestjs-cloudinary-community';
import 'dotenv/config';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from './image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigCloudinary } from './core/options/cloudinary.config';
import { TypeOrmOptions } from './core/options/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(TypeOrmOptions),
    CloudinaryModule.forRootAsync(ConfigCloudinary),
    ImageModule,
  ],
})
export class AppModule {}
