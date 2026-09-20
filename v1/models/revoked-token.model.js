import mongoose from 'mongoose';

// Denylist for logged-out JWTs. Entries expire with the token itself (TTL index), so it never grows unbounded.

const revokedTokenSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
});

export default mongoose.model('RevokedToken', revokedTokenSchema);
