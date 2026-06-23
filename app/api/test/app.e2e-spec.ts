import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
      });
  });

  it('GET /api/restaurants returns 200 and an array', () => {
    return request(app.getHttpServer())
      .get('/api/restaurants')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('POST /api/auth/register with invalid data returns 400', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'A', email: 'invalid', password: 'weak' })
      .expect(400);
  });

  it('POST /api/auth/login with invalid credentials returns 401', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'WrongPass1' })
      .expect(401);
  });

  it('POST /api/bookings without token returns 401', () => {
    return request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        restaurantId: '507f1f77bcf86cd799439011',
        dateSlot: new Date(Date.now() + 86400000).toISOString(),
        partySize: 2,
        idempotencyKey: 'test-e2e-no-auth',
      })
      .expect(401);
  });
});
