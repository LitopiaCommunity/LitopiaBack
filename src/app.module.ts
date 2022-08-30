import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./models/users/users.module";
import { AuthModule } from './auth/auth.module';
import { PassportModule } from "@nestjs/passport";
import { SessionsModule } from "./models/sessions/sessions.module";
import * as session from 'express-session';
import * as passport from 'passport';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({session:true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        name:'nestTypeOrm',
        type: 'postgres' as 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT')),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASS'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('PRODUCTION'),
        logging:[]
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    SessionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor() {
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          //I don't know how to corectly store session...
          //So for now we will ignore the problem until we must need to corectly store that in productions
          //store: new TypeormStore().connect(this.sessionsRepository),
          saveUninitialized: false,
          secret: 'sup3rs3cr3t',
          resave: false,
          cookie: {
            sameSite: true,
            httpOnly: false,
            maxAge: 60000,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
