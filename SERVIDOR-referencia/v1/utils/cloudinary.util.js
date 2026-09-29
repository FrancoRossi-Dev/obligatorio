import { PassThrough } from "stream";

export function uploadBufferToCloudinary(cloudinaryInstance, buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const passthrough = new PassThrough();
    const stream = cloudinaryInstance.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    passthrough.end(buffer);
    passthrough.pipe(stream);
  });
}

export default uploadBufferToCloudinary;
