import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: String,
  type: { type: String },
  amount: Number,
});

const creditSchema = new mongoose.Schema({
  name: { type: String },
  date: { type: String },
  amount: { type: Number },
  paid: { type: Boolean, default: false },
  transactions: [transactionSchema],
});

const Credit = mongoose.model('Credit', creditSchema);

export default Credit;
