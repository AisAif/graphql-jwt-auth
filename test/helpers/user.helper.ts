import { User } from '@/user/user.model';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export const createTestUser = async (
  user: User,
  dataSource: DataSource,
): Promise<User> => {
  return await dataSource.getRepository(User).save({
    name: user.name,
    username: user.username,
    password: await bcrypt.hash(user.password, 10),
  });
};
