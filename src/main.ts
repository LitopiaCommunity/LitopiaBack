import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Litopia API')
    .setDescription('This is the Litopia API an api made to manange player of litopia an lot more !')
    .setVersion('1.0')
    .setLicense('AGPL-3.0','https://www.gnu.org/licenses/agpl-3.0.html')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(app.get(ConfigService).get('APP_PORT'));
}
bootstrap();
