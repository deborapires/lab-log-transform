import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / should return a personalized greeting', () => {
    const expectedGreeting = 'Welcome to the User Order Management API!';

    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(expectedGreeting);
  });

  it('GET /health should return a 200 OK status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  it('GET /nonexistent-route should return a 404 Not Found error', () => {
    return request(app.getHttpServer())
      .get('/nonexistent-route')
      .expect(404);
  });
});
