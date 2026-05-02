import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  CloudinaryModuleAsyncOptions,
  CloudinaryModuleOptions,
} from 'nestjs-cloudinary-community';

export const ConfigCloudinary: CloudinaryModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): CloudinaryModuleOptions => ({
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME')!,
    api_key: configService.get('CLOUDINARY_API_KEY')!,
    api_secret: configService.get('CLOUDINARY_API_SECRET')!,
  }),
};
