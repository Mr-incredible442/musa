import { Schema, model } from 'mongoose';

const employeeSchema = new Schema(
  {
    code: {
      type: Number,
    },
    nrc: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    number: {
      type: String,
    },
    dailySalary: {
      type: Number,
    },
    section: {
      type: String,
    },
    creditOwed: {
      type: Number,
    },
    contract: {
      type: String,
    },
    contractStart: {
      type: String,
    },
    contractEnd: {
      type: String,
    },
    benefitCollectedOn: {
      type: String,
    },
    fullTime: {
      type: Boolean,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Employee = model('Employee', employeeSchema);

export default Employee;
