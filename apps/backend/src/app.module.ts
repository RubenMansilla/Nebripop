import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// MÓDULOS DEL PROYECTO
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';

// 🟩 AÑADIR CHAT MODULE
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

        autoLoadEntities: true, // ← detecta todas las entidades automáticamente (incluye Chat y ChatMessage)
        synchronize: false,     // ← NO TOCAR (Supabase NO permite sync)

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

    // 🟩 MÓDULO DEL CHAT
    ChatModule,
  ],
})
export class AppModule {}
