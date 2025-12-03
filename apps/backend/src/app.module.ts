import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get<string>('DATABASE_URL'),

                autoLoadEntities: true,
                synchronize: false,

                // NECESARIO para Supabase
                ssl: {
                    rejectUnauthorized: false,
                },
            }),
        }),

        UsersModule,
        AuthModule,
    ],
})
export class AppModule { }
