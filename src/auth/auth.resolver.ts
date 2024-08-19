import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login.response';
import { LoginInput } from './dto/login.input';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.model';
import { RegisterInput } from './dto/register.input';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  register(@Args('registerInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => LoginResponse)
  @UseGuards(LocalAuthGuard)
  async login(@Args('loginInput') _: LoginInput, @Context() ctx) {
    return this.authService.login(ctx.user);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async profile(@Context() ctx) {
    return ctx.req.user;
  }
}
