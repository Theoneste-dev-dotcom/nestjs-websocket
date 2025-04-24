import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
@WebSocketGateway({cors: {origin: "*"}})
export class MyGateway implements OnModuleInit{

    // creating the socket instancae
    @WebSocketServer()
    server: Server;

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