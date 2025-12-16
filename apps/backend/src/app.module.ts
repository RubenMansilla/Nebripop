import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PurchasesModule } from './purchases/purchases.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
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
        ProductsModule,
        ReviewsModule,
        FavoritesModule,
        PurchasesModule,
        CategoriesModule,
        SubcategoriesModule,
    ],
})
export class AppModule { }
