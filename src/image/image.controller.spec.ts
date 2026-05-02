import { Test, TestingModule } from '@nestjs/testing';
import { BulkDeleteImagesDto } from './dto/bulk-delete-images.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

describe('ImageController', () => {
  let controller: ImageController;
  let imageService: jest.Mocked<
    Pick<
      ImageService,
      | 'create'
      | 'createMany'
      | 'findAll'
      | 'findOne'
      | 'update'
      | 'remove'
      | 'removeFolder'
      | 'removeMany'
    >
  >;

  const multerFile = {
    fieldname: 'file',
    originalname: 'x.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('x'),
    size: 1,
  } as Express.Multer.File;

  beforeEach(async () => {
    imageService = {
      create: jest.fn(),
      createMany: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeFolder: jest.fn(),
      removeMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [{ provide: ImageService, useValue: imageService }],
    }).compile();

    controller = module.get(ImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service with file and folder', async () => {
    const payload = { message: 'ok', image: {} };
    imageService.create.mockResolvedValue(payload);

    const result = await controller.create(multerFile, 'albums');

    expect(imageService.create).toHaveBeenCalledWith(multerFile, 'albums');
    expect(result).toBe(payload);
  });

  it('createMany delegates to service', async () => {
    const files = [multerFile];
    imageService.createMany.mockResolvedValue({ message: 'ok', images: [] });

    await controller.createMany(files, 'f');

    expect(imageService.createMany).toHaveBeenCalledWith(files, 'f');
  });

  it('findAll delegates to service', async () => {
    imageService.findAll.mockResolvedValue({ message: 'ok', images: [] });

    await controller.findAll();

    expect(imageService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates with numeric id', async () => {
    imageService.findOne.mockResolvedValue({ message: 'ok', image: {} });

    await controller.findOne(7);

    expect(imageService.findOne).toHaveBeenCalledWith(7);
  });

  it('update delegates with id, dto, and file', async () => {
    const dto: UpdateImageDto = { public_id: 'p/old' };
    imageService.update.mockResolvedValue({ message: 'updated' });

    await controller.update(4, dto, multerFile);

    expect(imageService.update).toHaveBeenCalledWith(4, dto, multerFile);
  });

  it('removeMany delegates with dto.ids', async () => {
    const dto: BulkDeleteImagesDto = { ids: [1, 2] };
    imageService.removeMany.mockResolvedValue({ message: 'deleted' });

    await controller.removeMany(dto);

    expect(imageService.removeMany).toHaveBeenCalledWith([1, 2]);
  });

  it('removeFolder delegates with path', async () => {
    imageService.removeFolder.mockResolvedValue({ message: 'ok' });

    await controller.removeFolder('summer');

    expect(imageService.removeFolder).toHaveBeenCalledWith('summer');
  });

  it('remove delegates with id', async () => {
    imageService.remove.mockResolvedValue({ message: 'ok' });

    await controller.remove(9);

    expect(imageService.remove).toHaveBeenCalledWith(9);
  });
});
