import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { SocketModule } from './socket/socket.module';
import { GatewayModule } from './gateway/gateway.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({
        isGlobal:true,
      })],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], 
        synchronize: true, 
        logging: configService.get<boolean>('LOGGING', false), 
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    GatewayModule
  ],

})
export class AppModule {}