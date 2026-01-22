import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// MÓDULOS DEL PROYECTO
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AuctionsModule } from './auctions/auctions.module';
import { PurchasesModule } from './purchases/purchases.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { WalletModule } from './wallet/wallet.module';
import { NotificationsModule } from './notifications/notifications.module';

// 🟩 CHAT
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // ==== VARIABLES DE ENTORNO ====
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ==== TYPEORM + SUPABASE ====
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // NO TOCAR (Supabase)
        ssl: {
          rejectUnauthorized: false, // Necesario para Supabase
        },
      }),
    }),

    // ==== MÓDULOS DEL PROYECTO ====
    UsersModule,
    AuthModule,
    ProductsModule,
    ReviewsModule,
    FavoritesModule,
    AuctionsModule,
    PurchasesModule,
    CategoriesModule,
    SubcategoriesModule,
    WalletModule,
    NotificationsModule,

    // ==== CHAT ====
    ChatModule,
  ],
})
export class AppModule { }
