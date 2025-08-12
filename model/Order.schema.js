import { Schema, model } from 'mongoose';

// Define Product schema
const productSchema = new Schema({
  code: { type: Number },
  name: { type: String },
  available: { type: Number },
  quantity: { type: Number },
  comment: { type: String },
});

// Define Order schema and reference the Product schema in the products array
const orderSchema = new Schema(
  {
    date: { type: String },
    products: { type: [productSchema], default: [] },
    status: { type: String },
  },
  {
    timestamps: true,
  },
);

const Order = model('Order', orderSchema);
export default Order;
