import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'nestjs-cloudinary-community';
import 'dotenv/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageModule } from './image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image/entities/image.entity';
import { ConfigCloudinary } from './core/options/cloudinary.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('HOST_DB')!,
        port: configService.get('PORT_DB')!,
        username: configService.get('USERNAME_DB')!,
        password: configService.get('PASSWORD_DB')!,
        database: configService.get('NAME_DB')!,
        entities: [Image],
        synchronize: true,
      }),
    }),
    CloudinaryModule.forRootAsync(ConfigCloudinary),
    ImageModule,
  ],
})
export class AppModule {}
