import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from '../../src/image/image.controller';
import { ImageService } from '../../src/image/image.service';

export type ImageServiceMock = {
  create: jest.Mock;
  createMany: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  removeFolder: jest.Mock;
  removeMany: jest.Mock;
};

export function createImageServiceMock(
  overrides: Partial<Record<keyof ImageServiceMock, jest.Mock>> = {},
): ImageServiceMock {
  const base: ImageServiceMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn().mockResolvedValue({ message: 'ok', images: [] }),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeFolder: jest.fn(),
    removeMany: jest.fn(),
  };
  return { ...base, ...overrides };
}

export async function createImageHttpApp(
  overrides: Partial<Record<keyof ImageServiceMock, jest.Mock>> = {},
): Promise<{ app: INestApplication; serviceMock: ImageServiceMock }> {
  const serviceMock = createImageServiceMock(overrides);
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [ImageController],
    providers: [{ provide: ImageService, useValue: serviceMock }],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  await app.init();
  return { app, serviceMock };
}
