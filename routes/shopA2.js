import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

import Shift from '../model/ShopA2.schema.js';

// get all shifts
router.get('/shifts', async (req, res) => {
  try {
    const shift = await Shift.find();

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get the current shift
router.get('/', async (req, res) => {
  try {
    const shift = await Shift.findOne().sort({ _id: -1 }).limit(1);

    res.json(shift);
    req.app.get('io').emit('shopa2', shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get a single shift
router.get('/:id', async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add a new product
router.post('/:id/addtostock', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, ostock } = req.body;

    const ostockValue = ostock !== undefined ? ostock : 0;

    const maxCodeResult = await Shift.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      { $unwind: '$stock' },
      { $group: { _id: null, maxCode: { $max: '$stock.code' } } },
    ]);

    const generatedCode = (maxCodeResult[0]?.maxCode || 39999) + 1;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: {
          stock: {
            _id: mongoose.Types.ObjectId(),
            code: generatedCode,
            price: Number(price),
            name: name.toLowerCase(),
            ostock: ostockValue,
            received: 0,
            damage: 0,
            cstock: 0,
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (updatedShift.status === 'current') {
      req.app.get('io').emit('shopa2', updatedShift);
    }
    res.json(updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// edit a product's stock
router.post('/:shiftId/editstock/:stockId', async (req, res) => {
  try {
    const { shiftId, stockId } = req.params;
    const { ostock, damage, cstock } = req.body;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: shiftId, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.ostock': Number(ostock),
          'stock.$.damage': Number(damage),
          'stock.$.cstock': Number(cstock),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Shift or stock item not found' });
    }

    if (updatedShift.status === 'current') {
      req.app.get('io').emit('shopa2', updatedShift);
    }
    res.json(updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// edit a product's name
router.post('/:shiftId/editname/:stockId', async (req, res) => {
  try {
    const { shiftId, stockId } = req.params;
    const { name, price } = req.body;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: shiftId, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.price': Number(price),
          'stock.$.name': name.toLowerCase(),
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Shift or stock item not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete a product
router.delete('/:id/deletestock/:productId', async (req, res) => {
  try {
    const { id, productId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: {
          stock: { _id: mongoose.Types.ObjectId(productId) },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// add received
router.post('/:id/addtoreceived', async (req, res) => {
  try {
    const { code, name, amount } = req.body;
    const { id } = req.params;

    const newReceivedObject = {
      _id: mongoose.Types.ObjectId(),
      code: Number(code),
      name: name.toLowerCase(),
      amount: Number(amount),
    };
    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { received: newReceivedObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    req.app.get('io').emit('shopa2', updatedShift);
    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete received
router.delete('/:shiftId/deletereceived/:receivedId', async (req, res) => {
  try {
    const { shiftId, receivedId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { received: { _id: mongoose.Types.ObjectId(receivedId) } },
      },
      { new: true }, // This option returns the modified document
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add credit
router.post('/:id/addtocredit', async (req, res) => {
  try {
    const { description, amount } = req.body;
    const { id } = req.params;

    const newCreditObject = {
      _id: mongoose.Types.ObjectId(),
      description: description.toLowerCase(),
      amount: Number(amount),
    };

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { credit: newCreditObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete credit
router.delete('/:shiftId/deletecredit/:creditId', async (req, res) => {
  try {
    const { shiftId, creditId } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $pull: { credit: { _id: mongoose.Types.ObjectId(creditId) } },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add cash
router.post('/:id/addtocash', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $push: { cash: Number(amount) },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete cash
router.delete('/:id/deletecash/:amount', async (req, res) => {
  try {
    const { id, amount } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: {
          cash: {
            $elemMatch: { $eq: Number(amount) },
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get the index of the first matching element
    const indexToRemove = updatedShift.cash.findIndex(
      (el) => el === Number(amount),
    );

    // Remove the first matching element using the positional $ operator
    if (indexToRemove !== -1) {
      updatedShift.cash.splice(indexToRemove, 1);
    }

    // Save the updated document
    await updatedShift.save();

    res.json(updatedShift);

    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// add cashier
router.post('/:id/addcashier', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        $push: { cashier: name },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// remove cashier
router.post('/:id/removecashier', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        $pull: { cashier: name },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add date in
router.post('/:id/adddatein', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        dateIn: date,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete date in
router.post('/:id/deletedatein', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        dateIn: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete date out
router.post('/:id/adddateout', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        dateOut: date,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete date out
router.post('/:id/deletedateout', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        dateOut: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add accountant
router.post('/:id/addaccountant', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        acountant: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    req.app.get('io').emit('shopa2', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// remove accountant
router.post('/:id/removeaccountant', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        acountant: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add checked by
router.post('/:id/addcheckedby', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        checkedBy: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    req.app.get('io').emit('shopa2', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// remove checked by
router.post('/:id/removecheckedby', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Shift.findOneAndUpdate(
      { _id: id },
      {
        checkedBy: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('shopa2', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create new shift
router.post('/newshift', async (req, res) => {
  try {
    const lastShift = await Shift.findOne().sort({ _id: -1 }).limit(1);

    if (!lastShift) {
      return res
        .status(404)
        .json({ message: 'No shifts found in the collection' });
    }

    // Update status of lastShift to 'previous'
    lastShift.status = 'previous';
    await lastShift.save();

    const clonedShift = {
      ...lastShift.toObject(),
      _id: mongoose.Types.ObjectId(),
      dateIn: '',
      dateOut: '',
      checkedBy: '',
      cashier: [],
      credit: [],
      cash: [],
      received: [],
      acountant: '',
      status: 'current',
    };

    // Set cstock value to ostock for each stock item and reset received and damage to 0
    clonedShift.stock = clonedShift.stock.map((stockItem) => ({
      ...stockItem,
      ostock: stockItem.cstock,
      cstock: 0,
      received: 0,
      damage: 0,
    }));

    // Save the cloned shift
    const newShift = new Shift(clonedShift);
    await newShift.save();

    res.json(newShift);
    req.app.get('io').emit('shopa2', newShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete shift
router.delete('/:id', async (req, res) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);

    if (!deletedShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    const lastShift = await Shift.findOne().sort({ _id: -1 }).limit(1);
    if (lastShift) {
      lastShift.status = 'current';
      await lastShift.save();
      req.app.get('io').emit('shopa2', lastShift);
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
