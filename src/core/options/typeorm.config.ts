import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Image } from '../../image/entities/image.entity';

export const TypeOrmOptions: TypeOrmModuleAsyncOptions = {
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
};
