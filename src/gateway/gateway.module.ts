import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { AuthModule } from "src/auth/auth.module";
import { ConnectionTrackerService } from "./ConntectionTrackerService";

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [MyGateway, ConnectionTrackerService],
    exports: [],
})
export class GatewayModule {}