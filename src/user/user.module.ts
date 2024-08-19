import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { userProviders } from './user.providers';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [...userProviders, UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
