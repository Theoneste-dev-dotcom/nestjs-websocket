import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./create-user.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    async findByEmail(email: string) {
      return await this.userRepository.findOne({where: {email}})
    }
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}


    async createUser(user:CreateUserDto) {
        const  {password} = user;
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
         return await this.userRepository.save(user);
    }

    async getUser(id:number) {
       return await this.userRepository.findOne({ where: { id } });
    }

    async findAllUsers() {
        return await this.userRepository.find();
    }
}