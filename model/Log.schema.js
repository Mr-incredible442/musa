import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  method: String,
  url: String,
  statusCode: Number,
  userName: String,
  headers: Object,
  body: Object,
  query: Object,
});

export const Log = mongoose.model('Log', logSchema);
