import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useWebSocketAdapter(new WsAdapter(app));

  // Security headers. CSP is disabled — this is a JSON API consumed cross-origin by
  // the SPA, so a page-level content policy doesn't apply and would only risk breakage.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5180').split(',');
  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (curl, mobile apps) with no origin
      if (!origin) return callback(null, true);
      // In dev, allow any localhost port (Vite may pick 5181, 5182, ...)
      if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3000;
  // Bind to 0.0.0.0 so the app is reachable inside containers (Railway, Docker).
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
