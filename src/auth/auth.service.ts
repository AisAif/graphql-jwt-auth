import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import * as bcrypt from 'bcryptjs';
import { User } from '@/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput) {
    if (registerInput.password !== registerInput.password_confirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    if (await this.usersService.findOne(registerInput.username)) {
      throw new BadRequestException('Username already exists');
    }

    return this.usersService.save({
      name: registerInput.name,
      username: registerInput.username,
      password: bcrypt.hashSync(registerInput.password, 10),
    });
  }

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginInput: LoginInput) {
    const user = await this.usersService.findOne(loginInput.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async getProfile(username: string): Promise<User> {
    return this.usersService.findOne(username);
  }
}
