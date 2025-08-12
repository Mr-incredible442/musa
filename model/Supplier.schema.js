import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String },
  kgs: [Number],
  date: { type: String },
  collectionDate: { type: String },
  paid: { type: Boolean },
  paidBy: { type: String },
});

export default mongoose.model('Supplier', supplierSchema);
