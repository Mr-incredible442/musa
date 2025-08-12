import { Schema, model } from 'mongoose';

const employeeTransactionSchema = new Schema({
  date: {
    type: String,
  },
  employeeId: {
    type: String,
  },
  employeeCode: {
    type: Number,
  },
  status: {
    type: String,
  },
  days: {
    type: Number,
  },
  dailySalary: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  deduction: {
    type: Number,
  },
  paid: {
    type: Boolean,
  },
  datesWorked: {
    type: Array,
  },
  comment: {
    type: String,
  },
  months:{
    type: Array
  }
});

const EmployeeTransaction = model(
  'EmployeeTransaction',
  employeeTransactionSchema,
);

export default EmployeeTransaction;
