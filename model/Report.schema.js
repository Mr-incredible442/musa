import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  date: {
    type: String,
  },
  cashIn: {
    type: Array,
  },
  cashOut: {
    type: Array,
  },
  cashMobile: {
    type: Array,
  },
  status: {
    type: String,
  },
});

export default mongoose.model('Report', reportSchema);
