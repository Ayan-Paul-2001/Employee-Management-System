import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  console.log(`Next Hunt Management System API running on http://localhost:${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
