import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

blacklistedTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 14 * 24 * 60 * 60 },
);

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);
