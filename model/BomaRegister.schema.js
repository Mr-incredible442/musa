import { Schema, model } from 'mongoose';

const bomaRegisterSchema = new Schema(
  {
    date: {
      type: String,
    },
    name: {
      type: String,
    },
    accountant: {
      type: String,
    },
    cash: {
      type: Number,
    },
    change: {
      type: Number,
    },
    status: {
      type: String,
    },
    expense: {
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

const Register = model('BomaRegister', bomaRegisterSchema);
export default Register;
