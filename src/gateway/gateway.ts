import { Logger, OnModuleInit, UseGuards } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket } from "socket.io"
import { WsAuthGuard } from "src/auth/WsAuthGuard";
import { ConnectionTrackerService } from "./ConntectionTrackerService";
import { AuthService } from "src/auth/auth.service";
@WebSocketGateway({cors: {origin: "*"}})
export class MyGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect{

    private readonly logger = new Logger(MyGateway.name);
    constructor(
        private readonly authService: AuthService,
        private readonly connectionTracker: ConnectionTrackerService
    ){}

        // creating the socket instancae

    
        @WebSocketServer()
        server: Server;

        
    handleDisconnect(client: Socket) {
        console.log("Client disconnected: ", client.id)
    }

    async handleConnection(client: Socket) {
        const token = client.handshake.auth?.token;

        if (!token) {
          console.log("❌ No token found in handshake.auth!");
          throw new WsException("jwt must be provided");
        }
      
        try {
          const user = await this.authService.verifyToken(token, true);
          console.log("✅ User connected:", user?.username);
        } catch (err) {
          console.error("❌ Token verification failed:", err.message);
          throw new WsException(err.message)
        }
    }
    
    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log("connected socket id: ",socket.id)
        })
    }

    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() body: any) {
        console.log('New message received:', body);
        this.server.emit('onMessage', body)
    }
}