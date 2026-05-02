import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CloudinaryService,
  cloudinary as cloudinarySdk,
} from 'nestjs-cloudinary-community';
import { EntityNotFoundError } from 'typeorm';
import { Image } from './entities/image.entity';
import { ImageService } from './image.service';

jest.mock('nestjs-cloudinary-community', () => {
  const actual = jest.requireActual<
    typeof import('nestjs-cloudinary-community')
  >('nestjs-cloudinary-community');
  return {
    ...actual,
    cloudinary: {
      ...actual.cloudinary,
      image: jest.fn(() => 'https://cdn.example/transformed.png'),
    },
  };
});

type RepoMock = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneOrFail: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

type CloudinaryMock = {
  uploadOne: jest.Mock;
  uploadMany: jest.Mock;
  replaceOne: jest.Mock;
  delete: jest.Mock;
};

describe('ImageService', () => {
  let service: ImageService;
  let repository: RepoMock;
  let cloudinarySvc: CloudinaryMock;

  const multerFile = {
    fieldname: 'file',
    originalname: 'x.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('test'),
    size: 4,
  } as Express.Multer.File;

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation((v: unknown) => v),
      save: jest.fn(),
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    cloudinarySvc = {
      uploadOne: jest.fn(),
      uploadMany: jest.fn(),
      replaceOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        { provide: getRepositoryToken(Image), useValue: repository },
        { provide: CloudinaryService, useValue: cloudinarySvc },
      ],
    }).compile();

    service = module.get(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('uploads, persists with default folder, and returns payload', async () => {
      cloudinarySvc.uploadOne.mockResolvedValue({
        url: 'https://cdn.example/u.png',
        id_public: 'images/u',
      });
      const createdRow: Pick<Image, 'url' | 'public_id'> = {
        url: 'https://cdn.example/u.png',
        public_id: 'images/u',
      };
      repository.create.mockReturnValue(createdRow);
      repository.save.mockResolvedValue(
        Object.assign({}, createdRow, { id_image: 1 }),
      );

      const result = await service.create(multerFile);

      expect(cloudinarySvc.uploadOne).toHaveBeenCalledWith(
        multerFile,
        'images',
      );
      expect(repository.create).toHaveBeenCalledWith({
        url: 'https://cdn.example/u.png',
        public_id: 'images/u',
      });
      expect(repository.save).toHaveBeenCalledWith(createdRow);
      expect(result).toEqual({
        message: 'Image created successfully',
        image: createdRow,
      });
    });

    it('passes custom folder to uploadOne', async () => {
      cloudinarySvc.uploadOne.mockResolvedValue({
        url: 'https://cdn.example/u.png',
        id_public: 'custom/u',
      });
      repository.create.mockReturnValue({});
      repository.save.mockResolvedValue({ id_image: 1 });

      await service.create(multerFile, 'custom');

      expect(cloudinarySvc.uploadOne).toHaveBeenCalledWith(
        multerFile,
        'custom',
      );
    });

    it('propagates upload failures', async () => {
      cloudinarySvc.uploadOne.mockRejectedValue(new Error('upload failed'));

      await expect(service.create(multerFile)).rejects.toThrow('upload failed');
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('uploads many and saves mapped rows', async () => {
      const files = [multerFile, multerFile];
      cloudinarySvc.uploadMany.mockResolvedValue([
        { url: 'https://a', id_public: 'p/a' },
        { url: 'https://b', id_public: 'p/b' },
      ]);
      const createdRows: Pick<Image, 'url' | 'public_id'>[] = [
        { url: 'https://a', public_id: 'p/a' },
        { url: 'https://b', public_id: 'p/b' },
      ];
      repository.create.mockReturnValue(createdRows);
      repository.save.mockResolvedValue(createdRows);

      const result = await service.createMany(files);

      expect(cloudinarySvc.uploadMany).toHaveBeenCalledWith(files, 'images');
      expect(repository.create).toHaveBeenCalledWith([
        { url: 'https://a', public_id: 'p/a' },
        { url: 'https://b', public_id: 'p/b' },
      ]);
      expect(result).toEqual({
        message: 'Images created successfully',
        images: createdRows,
      });
    });

    it('passes custom folder to uploadMany', async () => {
      const files = [multerFile];
      cloudinarySvc.uploadMany.mockResolvedValue([
        { url: 'https://a', id_public: 'gallery/a' },
      ]);
      repository.create.mockReturnValue([
        { url: 'https://a', public_id: 'gallery/a' },
      ]);
      repository.save.mockResolvedValue([]);

      await service.createMany(files, 'gallery');

      expect(cloudinarySvc.uploadMany).toHaveBeenCalledWith(files, 'gallery');
    });
  });

  describe('findAll', () => {
    it('returns all images from repository', async () => {
      const rows: Image[] = [
        {
          id_image: 1,
          url: 'u',
          public_id: 'p',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.find.mockResolvedValue(rows);

      const result = await service.findAll();

      expect(result).toEqual({
        message: 'Images found successfully',
        images: rows,
      });
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      (cloudinarySdk.image as jest.Mock).mockReturnValue(
        'https://cdn.example/transformed.png',
      );
    });

    it('returns image when found and replaces url via cloudinary.image', async () => {
      const row: Image = {
        id_image: 5,
        url: 'https://original.example/x',
        public_id: 'folder/item',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.findOneOrFail.mockResolvedValue({ ...row });

      const result = await service.findOne(5);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id_image: 5 },
      });
      expect(cloudinarySdk.image).toHaveBeenCalledWith('folder/item', {
        width: 100,
        height: 100,
        crop: 'fill',
      });
      expect(result).toEqual({
        message: 'Image found successfully',
        image: {
          ...row,
          url: 'https://cdn.example/transformed.png',
        },
      });
    });

    it('propagates repository errors when missing', async () => {
      repository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Image, { id_image: 99 }),
      );

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        EntityNotFoundError,
      );
    });
  });

  describe('update', () => {
    it('replaces asset and updates url', async () => {
      repository.findOneOrFail.mockResolvedValue({
        id_image: 2,
        url: '',
        public_id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cloudinarySvc.replaceOne.mockResolvedValue({
        url: 'https://cdn.example/new.png',
        id_public: 'replaced',
      });
      repository.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      const result = await service.update(
        2,
        { public_id: 'old/id' },
        multerFile,
      );

      expect(cloudinarySvc.replaceOne).toHaveBeenCalledWith(
        multerFile,
        'old/id',
      );
      expect(repository.update).toHaveBeenCalledWith(2, {
        url: 'https://cdn.example/new.png',
      });
      expect(result).toEqual({ message: 'Image updated successfully' });
    });

    it('does not replace when image id is missing', async () => {
      repository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Image, { id_image: 404 }),
      );

      await expect(
        service.update(404, { public_id: 'any' }, multerFile),
      ).rejects.toBeInstanceOf(EntityNotFoundError);
      expect(cloudinarySvc.replaceOne).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes row then cloudinary asset', async () => {
      const row: Image = {
        id_image: 3,
        url: '',
        public_id: 'folder/x',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.findOneOrFail.mockResolvedValue(row);
      repository.delete.mockResolvedValue({
        affected: 1,
        raw: [],
      });
      const save = jest.fn().mockResolvedValue(undefined);
      cloudinarySvc.delete.mockReturnValue({ save });

      const result = await service.remove(3);

      expect(repository.delete).toHaveBeenCalledWith(3);
      expect(cloudinarySvc.delete).toHaveBeenCalledWith([
        { kind: 'one', publicId: 'folder/x' },
      ]);
      expect(save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Image 3 deleted successfully' });
    });

    it('does not delete when image is missing', async () => {
      repository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Image, { id_image: 99 }),
      );

      await expect(service.remove(99)).rejects.toBeInstanceOf(
        EntityNotFoundError,
      );
      expect(repository.delete).not.toHaveBeenCalled();
      expect(cloudinarySvc.delete).not.toHaveBeenCalled();
    });
  });

  describe('removeFolder', () => {
    it('throws when no rows match', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.removeFolder('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes matching rows and folder in cloudinary', async () => {
      const rows: Image[] = [
        {
          id_image: 1,
          url: '',
          public_id: 'summer/a',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id_image: 2,
          url: '',
          public_id: 'summer/b',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.find.mockResolvedValue(rows);
      repository.delete.mockResolvedValue({
        affected: 2,
        raw: [],
      });
      const save = jest.fn().mockResolvedValue(undefined);
      cloudinarySvc.delete.mockReturnValue({ save });

      const result = await service.removeFolder('summer');

      expect(repository.delete).toHaveBeenCalledWith([1, 2]);
      expect(cloudinarySvc.delete).toHaveBeenCalledWith({
        kind: 'byFolder',
        path: 'summer',
      });
      expect(result).toEqual({
        message: 'Folder "summer" removed successfully',
      });
    });
  });

  describe('removeMany', () => {
    it('throws when no rows match ids', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.removeMany([9, 10])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes rows and cloudinary assets', async () => {
      const rows: Image[] = [
        {
          id_image: 1,
          url: '',
          public_id: 'p/1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id_image: 2,
          url: '',
          public_id: 'p/2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.find.mockResolvedValue(rows);
      repository.delete.mockResolvedValue({
        affected: 2,
        raw: [],
      });
      const save = jest.fn().mockResolvedValue(undefined);
      cloudinarySvc.delete.mockReturnValue({ save });

      const result = await service.removeMany([1, 2]);

      expect(repository.delete).toHaveBeenCalledWith([1, 2]);
      expect(cloudinarySvc.delete).toHaveBeenCalledWith([
        { kind: 'one', publicId: 'p/1' },
        { kind: 'one', publicId: 'p/2' },
      ]);
      expect(result).toEqual({
        message: 'Images deleted successfully: 1, 2',
      });
    });

    it('deletes only rows that exist and still echoes requested ids in message', async () => {
      const rows: Image[] = [
        {
          id_image: 1,
          url: '',
          public_id: 'p/1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.find.mockResolvedValue(rows);
      repository.delete.mockResolvedValue({
        affected: 1,
        raw: [],
      });
      const save = jest.fn().mockResolvedValue(undefined);
      cloudinarySvc.delete.mockReturnValue({ save });

      const result = await service.removeMany([1, 99]);

      expect(repository.delete).toHaveBeenCalledWith([1]);
      expect(cloudinarySvc.delete).toHaveBeenCalledWith([
        { kind: 'one', publicId: 'p/1' },
      ]);
      expect(result.message).toBe('Images deleted successfully: 1, 99');
    });
  });
});
