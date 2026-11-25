import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-setup';

type ExpressHandler = (req: any, res: any) => any;

let cachedServerPromise: Promise<ExpressHandler> | null = null;

async function getServerlessApp(): Promise<ExpressHandler> {
  if (!cachedServerPromise) {
    cachedServerPromise = (async () => {
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });
      configureApp(app);
      await app.init();
      return app.getHttpAdapter().getInstance() as ExpressHandler;
    })().catch((err) => {
      cachedServerPromise = null;
      throw err;
    });
  }
  return cachedServerPromise;
}

export default async function handler(req: any, res: any) {
  const server = await getServerlessApp();
  return server(req, res);
}
