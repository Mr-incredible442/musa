import mongoose from 'mongoose';
import { Router } from 'express';
import Order from '../model/Order.schema.js';

const router = Router();

// get all orders
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find();

    res.json(orders);
  } catch (error) {
    res.json({ message: error });
  }
});

// get order with status current
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'current' });

    req.app.get('io').emit('orders', orders);
    res.json(orders);
  } catch (error) {
    res.json({ message: error });
  }
});

// get a single order by id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.json({ message: error });
  }
});

// create new order
router.post('/', async (req, res) => {
  try {
    const currentOrder = await Order.findOneAndUpdate(
      { status: 'current' },
      { status: 'previous' },
      { new: true },
    );

    const order = new Order({
      date: req.body.date || new Date().toISOString().slice(0, 10),
      products: [],
      status: 'current',
    });

    const savedOrder = await order.save();
    res.json(savedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});

// update order date by id
router.patch('/:id', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { date: date },
      { new: true },
    );

    req.app.get('io').emit('orders', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// delete order by id
router.delete('/:id', async (req, res) => {
  try {
    const removedOrder = await Order.deleteOne({ _id: req.params.id });

    const mostRecentOrder = await Order.findOne().sort({ date: -1 });
    if (mostRecentOrder) {
      await Order.findByIdAndUpdate(
        mostRecentOrder._id,
        { status: 'current' },
        { new: true },
      );
    }

    res.json(removedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});
// change order status
router.patch('/:id/changestatus', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { status: req.body.status } },
      { new: true },
    );
    res.json(updatedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});

// add product to order
router.patch('/:id/addproduct', async (req, res) => {
  try {
    if (req.body.code) {
      const existingOrder = await Order.findOne({
        _id: req.params.id,
        'products.code': req.body.code,
      });

      if (existingOrder) {
        return res
          .status(400)
          .json({ message: 'Product already exists in the order list' });
      }
    }

    const product = {
      _id: new mongoose.Types.ObjectId(),
      code: req.body.code,
      name: req.body.name,
      available: req.body.available,
      quantity: req.body.quantity,
      comment: req.body.comment,
    };
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      { $push: { products: product } },
      { new: true },
    );

    if (updatedOrder.status === 'current') {
      req.app.get('io').emit('orders', updatedOrder);
    }
    res.json(updatedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});

// update product in order
router.patch('/:id/updateproduct', async (req, res) => {
  try {
    const { quantity, comment } = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, 'products._id': req.body._id },
      {
        $set: {
          'products.$.quantity': quantity,
          'products.$.comment': comment,
        },
      },
      { new: true },
    );

    req.app.get('io').emit('orders', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});

// remove product from order
router.patch('/:id/removeproduct/:productid', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { products: { _id: req.params.productid } } },
      { new: true },
    );

    req.app.get('io').emit('orders', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.json({ message: error });
  }
});

export default router;
