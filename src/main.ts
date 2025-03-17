import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for all routes
  await app.listen(3100);
  console.log('MindRoot Computer Use Server is running on port 3100');
}
bootstrap();
