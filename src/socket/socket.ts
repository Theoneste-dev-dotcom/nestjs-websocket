import { Injectable, OnModuleInit } from "@nestjs/common";
import { io, Socket } from "socket.io-client";
@Injectable()
export class SocketClient implements OnModuleInit{
  public SocketClient:Socket; 
  constructor() {
    this.SocketClient = io("http://localhost:9000")
  }

  onModuleInit() {

      this.registerConsumerEvents()
  }


  private registerConsumerEvents() {
    this.SocketClient.emit('newMessage', {msg:"new Message", content: "Hello World"})
    this.SocketClient.on("connect", () => {
      console.log("Connected to socket server gateway")
    });
    this.SocketClient.on("disconnect", () => {
      console.log("Disconnected from socket server gateway")
    });

    this.SocketClient.on('onMessage', payload=> {
        console.log("Payload received from socket server gateway", payload)

    })
  }
}