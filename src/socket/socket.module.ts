import { Module } from "@nestjs/common";
import { SocketClient } from "./socket";

@Module({
    imports: [],
    controllers: [],
    providers: [SocketClient],
    exports: [],
})
export class SocketModule {}
