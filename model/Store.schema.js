import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    keeper: {
      type: String,
    },
    accountant: {
      type: String,
    },
    shops: {
      type: [String],
    },
    checkedBy: {
      type: String,
    },
    received: {
      type: Array,
    },
    issued: {
      type: Array,
    },
    stock: {
      type: Array,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Store', storeSchema);
