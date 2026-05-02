import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createImageHttpApp } from './helpers/create-image-http-app';

describe('Image HTTP (e2e)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /image returns service payload', async () => {
    const list = { message: 'Images found successfully', images: [] };
    const { app: a } = await createImageHttpApp({
      findAll: jest.fn().mockResolvedValue(list),
    });
    app = a;

    const res = await request(a.getHttpServer()).get('/image').expect(200);

    expect(res.body).toEqual(list);
  });

  it('GET /image/:id rejects non-numeric id (ParseIntPipe)', async () => {
    const { app: a } = await createImageHttpApp();
    app = a;

    await request(a.getHttpServer()).get('/image/not-a-number').expect(400);
  });

  it('GET /image/:id returns 200 when service resolves', async () => {
    const payload = {
      message: 'Image found successfully',
      image: { id_image: 1, url: 'u', public_id: 'p' },
    };
    const { app: a } = await createImageHttpApp({
      findOne: jest.fn().mockResolvedValue(payload),
    });
    app = a;

    const res = await request(a.getHttpServer()).get('/image/1').expect(200);

    expect(res.body).toEqual(payload);
  });

  it('DELETE /image/bulk rejects invalid body', async () => {
    const { app: a } = await createImageHttpApp();
    app = a;

    await request(a.getHttpServer()).delete('/image/bulk').send({}).expect(400);
  });

  it('DELETE /image/bulk rejects empty ids array', async () => {
    const { app: a } = await createImageHttpApp();
    app = a;

    await request(a.getHttpServer())
      .delete('/image/bulk')
      .send({ ids: [] })
      .expect(400);
  });

  it('DELETE /image/bulk accepts valid payload and calls service', async () => {
    const out = { message: 'Images deleted successfully: 1, 2' };
    const removeMany = jest.fn().mockResolvedValue(out);
    const { app: a, serviceMock } = await createImageHttpApp({ removeMany });
    app = a;

    const res = await request(a.getHttpServer())
      .delete('/image/bulk')
      .send({ ids: [1, 2] })
      .expect(200);

    expect(res.body).toEqual(out);
    expect(serviceMock.removeMany).toHaveBeenCalledWith([1, 2]);
  });

  it('POST /image forwards multipart to service', async () => {
    const created = { message: 'Image created successfully', image: {} };
    const create = jest.fn().mockResolvedValue(created);
    const { app: a, serviceMock } = await createImageHttpApp({ create });
    app = a;

    const res = await request(a.getHttpServer())
      .post('/image')
      .field('folder', 'custom')
      .attach('file', Buffer.from('fake-png'), 'test.png')
      .expect(201);

    expect(res.body).toEqual(created);
    expect(serviceMock.create).toHaveBeenCalled();
    const [file, folder] = serviceMock.create.mock.calls[0];
    expect(folder).toBe('custom');
    expect(file).toMatchObject({
      fieldname: 'file',
      originalname: 'test.png',
    });
  });

  it('PATCH /image/:id forwards multipart body to service', async () => {
    const updated = { message: 'Image updated successfully' };
    const update = jest.fn().mockResolvedValue(updated);
    const { app: a, serviceMock } = await createImageHttpApp({ update });
    app = a;

    const res = await request(a.getHttpServer())
      .patch('/image/5')
      .field('public_id', 'cloudinary/public_id')
      .attach('file', Buffer.from('x'), 'n.png')
      .expect(200);

    expect(res.body).toEqual(updated);
    expect(serviceMock.update).toHaveBeenCalled();
    const [id, dto, file] = serviceMock.update.mock.calls[0];
    expect(id).toBe(5);
    expect(dto).toMatchObject({ public_id: 'cloudinary/public_id' });
    expect(file).toMatchObject({ fieldname: 'file', originalname: 'n.png' });
  });

  it('DELETE /image/folder/:path calls service', async () => {
    const out = { message: 'Folder "summer" removed successfully' };
    const removeFolder = jest.fn().mockResolvedValue(out);
    const { app: a, serviceMock } = await createImageHttpApp({ removeFolder });
    app = a;

    const res = await request(a.getHttpServer())
      .delete('/image/folder/summer')
      .expect(200);

    expect(res.body).toEqual(out);
    expect(serviceMock.removeFolder).toHaveBeenCalledWith('summer');
  });

  it('DELETE /image/:id uses ParseIntPipe and service', async () => {
    const out = { message: 'Image 3 deleted successfully' };
    const remove = jest.fn().mockResolvedValue(out);
    const { app: a, serviceMock } = await createImageHttpApp({ remove });
    app = a;

    const res = await request(a.getHttpServer()).delete('/image/3').expect(200);

    expect(res.body).toEqual(out);
    expect(serviceMock.remove).toHaveBeenCalledWith(3);
  });
});
