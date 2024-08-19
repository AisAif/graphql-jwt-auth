import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { name: 'user' })
  async findOne(@Args('username') username: string) {
    const user = await this.userService.findOne(username);
    if (!user) throw new NotFoundException();

    return user;
  }
}
