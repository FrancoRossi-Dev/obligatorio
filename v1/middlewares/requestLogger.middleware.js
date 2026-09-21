import { inspect } from 'node:util';

const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = ['password', 'confirmPassword', 'token', 'authorization'];

const redact = (data) => {
  if (Array.isArray(data)) return data.map(redact);
  if (data === null || typeof data !== 'object') return data;

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.includes(key.toLowerCase()) ? REDACTED : redact(value),
    ]),
  );
};

// Logs once the response is sent, so body (parsed later) and params (set by the matched route) are populated.
export const requestLoggerMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    const entry = {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      params: req.params,
      query: req.query,
      body: redact(req.body),
      headers: redact(req.headers),
      ip: req.ip,
    };

    console.log(inspect(entry, { colors: true, depth: null, compact: false }));
  });

  next();
};
