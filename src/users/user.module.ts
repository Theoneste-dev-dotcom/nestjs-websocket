import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(()=> AuthModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})

export class UserModule {}