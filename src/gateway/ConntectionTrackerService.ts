import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@Injectable()
export class ConnectionTrackerService implements OnModuleDestroy {
  private readonly logger = new Logger(ConnectionTrackerService.name);
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId → Set<socketId>

  addConnection(userId: string, socket: Socket) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    
    this.connectedUsers.get(userId)!.add(socket.id);
    this.logger.debug(`User ${userId} connected (socket ${socket.id})`);
  }

  removeConnection(socket: Socket) {
    const userId = socket.data?.user?.sub;
    if (userId && this.connectedUsers.has(userId)) {
      const sockets = this.connectedUsers.get(userId);
      sockets?.delete(socket.id);
      
      if (sockets?.size === 0) {
        this.connectedUsers.delete(userId);
      }
      
      this.logger.debug(`User ${userId} disconnected (socket ${socket.id})`);
    }
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && 
           (this.connectedUsers.get(userId)?.size ?? 0) > 0;
  }

  getUserSockets(userId: string): Set<string> {
    return this.connectedUsers.get(userId) || new Set();
  }

  onModuleDestroy() {
    this.connectedUsers.clear();
  }
}