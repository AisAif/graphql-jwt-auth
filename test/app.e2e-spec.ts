import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
  });
});
