import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { Socket } from 'socket.io';
  
  @Injectable()
  export class WsAuthGuard implements CanActivate {
    private readonly logger = new Logger(WsAuthGuard.name);
  
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (context.getType() !== 'ws') {
        this.logger.error('WsAuthGuard used in non-WebSocket context');
        throw new UnauthorizedException('WebSocket guard used incorrectly');
      }
  
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = client.handshake.auth.token;
  
      if (!token) {
        this.logger.warn(`No token provided by client ${client.id}`);
        client.emit('auth_error', { message: 'Authentication token required' });
        client.disconnect(true);
        return false;
      }
  
      try {
        const secret = this.configService.get<string>('JWT_SECRET_KEY');
        if (!secret) {
          throw new Error('JWT_SECRET_KEY is not configured');
        }
  
        const payload = await this.jwtService.verifyAsync(token, { secret });
        client.data.user = payload; // Attach user data to socket
        this.logger.log(`Authenticated user ${payload.sub} (${payload.email})`);
  
        return true;
      } catch (error) {
        this.logger.error(`JWT verification failed: ${error.message}`);
        client.emit('auth_error', { 
          message: 'Authentication failed',
          error: error.message 
        });
        client.disconnect(true);
        return false;
      }
    }
  }