import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const getAccessToken = async (
  username: string,
  password: string,
  app: INestApplication,
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: `#graphql
            mutation login {
                login(loginInput: { username: "${username}", password: "${password}" }) {
                    access_token
                    user {
                        name
                        username
                    }
                }
            }
        `,
    })
    .expect(200);

  return response.body.data.login.access_token;
};

