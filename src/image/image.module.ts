import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { CloudinaryModule } from 'nestjs-cloudinary-community';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), CloudinaryModule.forFeature()],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
