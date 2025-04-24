import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.createUser(user);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAllUsers();
  }
}
