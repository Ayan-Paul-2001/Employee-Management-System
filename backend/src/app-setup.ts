import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

function parseAllowedOrigins(): string[] {
  const raw = [
    process.env.FRONTEND_URL || '',
    process.env.CORS_ORIGINS || '',
  ]
    .join(',')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(
    new Set([
      ...raw,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]),
  );
}

export function configureApp(app: INestApplication): void {
  const allowedOrigins = parseAllowedOrigins();
  const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      if (allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Lightweight root & health check endpoints for Vercel/uptime monitors
  const httpInstance = app.getHttpAdapter().getInstance();
  if (httpInstance && typeof httpInstance.get === 'function') {
    const healthPayload = () => ({
      status: 'ok',
      service: 'Next Hunt Management System API',
      version: '2.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    });
    httpInstance.get('/', (_req, res) => res.status(200).json(healthPayload()));
    httpInstance.get('/health', (_req, res) => res.status(200).json(healthPayload()));
  }

  try {
    const config = new DocumentBuilder()
      .setTitle('Next Hunt Management System API')
      .setDescription(
        'REST API for Next Hunt Management System — Role-based Workforce, Attendance Analytics, Leave & Notice Platform powered by NestJS & MongoDB Atlas',
      )
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customCssUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
      ],
    });
  } catch (err: any) {
    console.warn('Swagger UI setup skipped in serverless runtime:', err?.message || err);
  }
}
