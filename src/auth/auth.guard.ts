import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
   
    const isHttp = context.getType() === 'http';
    const isWs = context.getType() === 'ws';

    if (!isHttp && !isWs) {
      console.error('Unsupported context type:', context.getType());
      throw new UnauthorizedException('Unsupported context type');
    }

    let token: string | undefined;

    // Extract token
    if (isHttp) {
      const request: Request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Invalid or missing Authorization header:', authHeader);
        throw new UnauthorizedException('Invalid or missing Authorization header');
      }

      token = authHeader.split(' ')[1];
      if (!token) {
        console.error('Token missing in HTTP request');
        throw new UnauthorizedException('Token missing');
      }
    } else if (isWs) {
      const client: Socket = context.switchToWs().getClient<Socket>();
      token = client.handshake.auth.token;
      console.log('WebSocket token received:', token); // Debug log

      if (!token) {
        console.error('WebSocket token missing');
        client.disconnect(true);
        return false;
      }
    }

    // Validate token
    try {
      const secret = this.configService.get<string>('JWT_SECRET_KEY');
      if (!secret) {
        console.error('JWT_SECRET_KEY is not configured');
        throw new Error('Server configuration error');
      }

      const payload = await this.jwtService.verifyAsync(token? token : "", { secret });
    
      // Attach payload
      if (isHttp) {
        const request: Request = context.switchToHttp().getRequest();
        request['user'] = payload;
      } else if (isWs) {
        const client: Socket = context.switchToWs().getClient<Socket>();
        client.handshake.auth.user = payload;
        console.log('User attached to handshake:', client.handshake.auth.user); // Debug log
      }

      return true;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      if (isWs) {
        const client: Socket = context.switchToWs().getClient<Socket>();
        client.emit('auth_error', { message: 'Invalid token' }); // Notify client
        client.disconnect(true);
        return false;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}