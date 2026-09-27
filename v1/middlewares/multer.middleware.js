import multer from 'multer';
import { ERRORS, httpError } from '../utils/http-error.js';

export const IMAGE_FIELD = 'image';
const MAX_IMAGE_SIZE_MB = 2;
// SVG is left out on purpose: it can carry scripts
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const IMAGE_MESSAGES = {
  required: 'An image file is required.',
  type: 'The image must be a PNG, JPEG, WEBP or GIF file.',
  size: `The image must be at most ${MAX_IMAGE_SIZE_MB} MB.`,
  field: `The image must be sent in the "${IMAGE_FIELD}" field, one file per request.`,
};

const imageError = (message) => httpError(ERRORS.invalidData, [{ field: IMAGE_FIELD, message }]);

// Multer reports its own failures by code; each one is a problem with what the client sent
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: IMAGE_MESSAGES.size,
  LIMIT_FILE_COUNT: IMAGE_MESSAGES.field,
  LIMIT_UNEXPECTED_FILE: IMAGE_MESSAGES.field,
};

// Kept in memory: the buffer goes straight to Cloudinary and never touches the disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, accept) => {
    if (IMAGE_TYPES.includes(file.mimetype)) return accept(null, true);
    accept(imageError(IMAGE_MESSAGES.type));
  },
}).single(IMAGE_FIELD);

// Parses a multipart/form-data request with one image; must run before body validation,
// since the other form fields only reach req.body through multer
export const uploadImageMiddleware = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return next(imageError(MULTER_MESSAGES[error.code] ?? IMAGE_MESSAGES.field));
    }
    if (error) return next(error);
    if (!req.file) return next(imageError(IMAGE_MESSAGES.required));
    next();
  });
};
