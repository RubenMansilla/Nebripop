import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from './config/env.module';

// 🔥 Importar módulos de tu aplicación
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EnvModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
