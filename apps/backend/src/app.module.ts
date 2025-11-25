import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // permite usar process.env en todo Nest
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),

        autoLoadEntities: true,
        synchronize: true,

        ssl: false,
      }),
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule { }
