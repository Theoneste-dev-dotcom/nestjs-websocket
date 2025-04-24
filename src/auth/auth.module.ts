import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'process';
import { UserModule } from 'src/users/user.module';
import { WsAuthGuard } from './WsAuthGuard';

@Module({
  imports:[forwardRef(()=> UserModule), 
    ConfigModule.forRoot({
      isGlobal:true
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET_KEY');
        return {
          secret: secret,
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
    forwardRef(()=> UserModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtService, WsAuthGuard],
  exports:[AuthService, AuthGuard,  JwtModule, JwtService, WsAuthGuard]

})
export class AuthModule {}