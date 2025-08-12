import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('session', userSessionSchema);
