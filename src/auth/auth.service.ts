import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { WsException } from '@nestjs/websockets';



@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if(user == null) {
      throw new Error("Failed")  
    }
    const isvalid  =  await bcrypt.compare(password, user.password)
    if(isvalid) {
      return user
    } else {
     
      throw new UnauthorizedException('Invalid credentials');
    
    }
    
  }

  async login(user: any){
    try {
      const validUser = await this.validateUser(user.email, user.password)
    const payload = { email: validUser.email, sub: validUser.id, name: validUser.username };
    const accessToken = this.jwtService.sign(payload, {secret:this.configService.get<string>('JWT_SECRET_KEY'), expiresIn: '2d' });
    const refreshToken = this.jwtService.sign(payload, {secret:this.configService.get<string>('JWT_SECRET_KEY'), expiresIn: '7d' });
  //  const isPasswordValid = this.
    return {token: accessToken}
    }catch(error) {
      console.log(error)
      throw new UnauthorizedException('Invalid credentials, pls check you email and address');
    }
  }

  async refreshToken(userId: number, refreshToken: string) {
    try{
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_SECRET_KEY')
    });

    const user = await this.userService.getUser(payload.sub)
 
    if(user == null) {
      throw new Error("Failed")
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    
    return { access_token };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
   
  }

  validateToken(token: string) {
    return this.jwtService.verify(token, {
        secret : process.env.JWT_SECRET_KEY
    });
}

// in jwtService
async verifyToken(token: string, isWs: boolean = false): Promise<User | null> {

  try {
    const secret = this.configService.get<string>('JWT_SECRET_KEY')
    if(!secret) {
      throw new Error("Failed to get the secret")
    }

    if(!token) {
      console.log("failed to get the token")
    }

    console.log(token)
    const payload = await this.jwtService.verify(token, {secret});
   
    const user = await this.userService.getUser(payload.sub);
     console.log(user)

    return user;
  } catch (err) {
    console.log(err)
    if (isWs) {
      throw new WsException(err.message);
    } else {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}


}
