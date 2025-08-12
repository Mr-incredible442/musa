import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    shift: {
      type: String,
    },
    cashier: {
      type: [String],
    },
    acountant: {
      type: String,
    },
    status: {
      type: String,
    },
    cash: {
      type: [Number],
    },
    change: {
      type: [Number],
    },
    credit: {
      type: Array,
    },
    bus: {
      type: Array,
    },
    topup: {
      type: Array,
    },
    received: {
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

export default mongoose.model('Shift', restaurantSchema);
