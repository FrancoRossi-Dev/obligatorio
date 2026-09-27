import { PassThrough } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { ERRORS, httpError } from '../utils/http-error.js';

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result),
    );
    new PassThrough().end(buffer).pipe(stream);
  });

// Returns the public URL and the folder the image was stored in. Accounts on Cloudinary's
// dynamic folders mode answer with asset_folder; older ones with folder
export const uploadImageService = async (buffer, folder) => {
  try {
    const result = await uploadBuffer(buffer, { resource_type: 'image', folder });
    return { url: result.secure_url, folder: result.asset_folder ?? result.folder };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw httpError(ERRORS.imageStorageUnavailable);
  }
};
