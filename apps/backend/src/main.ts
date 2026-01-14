import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  // ❌ NO uses { cors: true } aquí si luego llamas a enableCors
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, servidor, etc.)
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "https://nebripop.vercel.app",
      ];

      if (allowed.includes(origin)) return callback(null, true);

      // Bloquea el resto
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // NECESARIO para convertir strings → number/boolean
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.listen(process.env.PORT || 3001);
}

bootstrap();
