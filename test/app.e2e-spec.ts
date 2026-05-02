import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createImageHttpApp } from './helpers/create-image-http-app';

describe('Application (e2e)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('exposes image collection route', async () => {
    const { app: a } = await createImageHttpApp({
      findAll: jest.fn().mockResolvedValue({
        message: 'Images found successfully',
        images: [],
      }),
    });
    app = a;

    await request(a.getHttpServer()).get('/image').expect(200);
  });
});
