export const postSingleFileField = {
  type: 'object' as const,
  properties: {
    file: { type: 'string', format: 'binary' },
    folder: {
      type: 'string',
      description:
        'Target folder in Cloudinary (optional; defaults to "images")',
      example: 'images',
    },
  },
  required: ['file'],
};

export const postMultipleFilesField = {
  type: 'object' as const,
  properties: {
    files: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
    },
    folder: {
      type: 'string',
      description:
        'Target folder in Cloudinary (optional; defaults to "images")',
      example: 'images',
    },
  },
  required: ['files'],
};

export const updateImageBodySchema = {
  schema: {
    type: 'object',
    required: ['file', 'public_id'],
    properties: {
      public_id: { type: 'string', example: 'images/abc123' },
      file: { type: 'string', format: 'binary' },
    },
  },
};

export const deleteFolderParamSchema = {
  name: 'path',
  type: 'string',
  example: 'images',
};

export const deleteImageParamSchema = {
  name: 'id',
  type: 'number',
  example: 1,
  description: 'Image ID',
};
