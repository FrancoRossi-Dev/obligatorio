export function runMulterSingle(upload, field, req, res) {
  return new Promise((resolve, reject) => {
    upload.single(field)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export default runMulterSingle;
