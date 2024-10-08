import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createTestUser } from './helpers/user.helper';
import { getAccessToken } from './helpers/auth.helper';

describe('GraphQL (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          entities: [__dirname + '/../src/**/*.model{.ts,.js}'],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    afterEach(async () => {
      await dataSource.query('DELETE FROM users');
    });
    it('should success', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation register {
              register(
                registerInput: {
                  name: "ais aif"
                  username: "ais_aif"
                  password: "password"
                  password_confirmation: "password"
                }
              ) {
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.register.name).toBe('ais aif');
        });
    });
    it('should fail when validation error', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation register {
              register(
                registerInput: {
                  name: "a"
                  username: ""
                  password: "passw"
                  password_confirmation: "pa"
                }
              ) {
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Bad Request Exception');
        });
    });
    it('should fail when pass dont match', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation register {
              register(
                registerInput: {
                  name: "ais aif"
                  username: "ais_aif"
                  password: "passwords"
                  password_confirmation: "password"
                }
              ) {
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Passwords do not match');
        });
    });
    it('should fail when username already exists', async () => {
      await createTestUser(
        {
          name: 'ais aif',
          username: 'ais_aif',
          password: 'password',
        },
        dataSource,
      );
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation register {
              register(
                registerInput: {
                  name: "ais aif"
                  username: "ais_aif"
                  password: "password"
                  password_confirmation: "password"
                }
              ) {
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Username already exists');
        });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await createTestUser(
        {
          name: 'ais aif',
          username: 'ais_aif',
          password: 'password',
        },
        dataSource,
      );
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM users');
    });

    it('should success', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation login {
              login(loginInput: { username: "ais_aif", password: "password" }) {
                access_token
                user {
                  name
                  username
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.access_token).toBeDefined();
        });
    });

    it('should fail when credentials is wrong', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            mutation login {
              login(loginInput: { username: "salah", password: "salah" }) {
                access_token
                user {
                  name
                  username
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Unauthorized');
        });
    });
  });

  describe('profile', () => {
    let accessToken: string;
    beforeEach(async () => {
      await createTestUser(
        {
          name: 'ais aif',
          username: 'ais_aif',
          password: 'password',
        },
        dataSource,
      );

      accessToken = await getAccessToken('ais_aif', 'password', app);
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM users');
    });

    it('should success', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            query profile {
              profile {
                name
                username
              }
            }
          `,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.profile.name).toBe("ais aif");
          expect(res.body.data.profile.username).toBe("ais_aif");
        });
    });

    it('should fail when unauthorized', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `#graphql
            query profile {
              profile {
                name
                username
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe("Unauthorized");
        });
    });
  });
});
