import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

import Register from '../model/Register.schema.js';

router.get('/', async (req, res) => {
  try {
    const register = await Register.findOne().sort({ _id: -1 }).limit(1);

    res.json(register);
    req.app.get('io').emit('register', register);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all
router.get('/all', async (req, res) => {
  try {
    const shifts = await Register.find();

    res.json(shifts);
  } catch {
    res.status(500).json({ message: error.message });
  }
});

// get one
router.get('/:id', async (req, res) => {
  try {
    const shift = await Register.findOne({ _id: req.params.id });

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create a stock item
router.post('/:id/addtostock', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, section, quantity, unitPrice, priceBought } = req.body;

    const updatedShift = await Register.findByIdAndUpdate(
      id,
      {
        $push: {
          stock: {
            _id: mongoose.Types.ObjectId(),
            code: code,
            name: name.toLowerCase(),
            quantity: Number(quantity),
            priceBought: Number(priceBought),
            unitPrice: Number(unitPrice),
            section: section.toLowerCase(),
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a stock item
router.post('/:id/deletestock/:stockId', async (req, res) => {
  try {
    const { id, stockId } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          stock: { _id: mongoose.Types.ObjectId(stockId) },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update quantity, priceBought, unitPrice and section in a stock item
router.post('/:id/updatestock/:stockId', async (req, res) => {
  try {
    const { id, stockId } = req.params;
    const { quantity, priceBought, unitPrice, section } = req.body;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id, 'stock._id': mongoose.Types.ObjectId(stockId) },
      {
        $set: {
          'stock.$.quantity': Number(quantity),
          'stock.$.priceBought': Number(priceBought),
          'stock.$.unitPrice': Number(unitPrice),
          'stock.$.section': section.toLowerCase(),
        },
      },
      {
        new: true,
      },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add expense
router.post('/:id/addtoexpense', async (req, res) => {
  try {
    const { description, amount } = req.body;
    const { id } = req.params;

    const newCreditObject = {
      _id: mongoose.Types.ObjectId(),
      description: description.toLowerCase(),
      amount: Number(amount),
    };

    const updatedShift = await Register.findByIdAndUpdate(
      id,
      {
        $push: { expense: newCreditObject },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete expense
router.post('/:id/deleteexpense/:expenseid', async (req, res) => {
  try {
    const { id, expenseid } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          expense: {
            _id: mongoose.Types.ObjectId(expenseid),
          },
        },
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add date
router.post('/:id/adddate', async (req, res) => {
  try {
    const { date } = req.body;
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        date: date,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete date
router.post('/:id/deletedate', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        date: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add name
router.post('/:id/addname', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        name: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    //only send through socket if updatedShift.status is === to current

    req.app.get('io').emit('register', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete name
router.post('/:id/deletename', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        name: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add accountant
router.post('/:id/addaccountant', async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        accountant: name,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    //only send through socket if updatedShift.status is === to current

    req.app.get('io').emit('register', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete accountant
router.post('/:id/deleteaccountant', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        accountant: '',
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add cash
router.post('/:id/addcash', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        cash: Number(amount),
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    //only send through socket if updatedShift.status is === to current

    req.app.get('io').emit('register', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete cash
router.post('/:id/deletecash', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        cash: 0,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add change
router.post('/:id/addchange', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        change: Number(amount),
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    //only send through socket if updatedShift.status is === to current

    req.app.get('io').emit('register', updatedShift);

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete change
router.post('/:id/deletechange', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedShift = await Register.findOneAndUpdate(
      { _id: id },
      {
        change: 0,
      },
      { new: true },
    );

    if (!updatedShift) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updatedShift);
    req.app.get('io').emit('register', updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//new shift
router.post('/newshift', async (req, res) => {
  try {
    const lastShift = await Register.findOne().sort({ _id: -1 }).limit(1);

    if (!lastShift) {
      return res
        .status(404)
        .json({ message: 'No shifts found in the collection' });
    }

    lastShift.status = 'previous';
    await lastShift.save();

    const clonedShift = {
      ...lastShift.toObject(),
      _id: mongoose.Types.ObjectId(),
      date: '',
      name: '',
      accountant: '',
      cash: 0,
      change: 0,
      stock: [],
      expense: [],
      status: 'current',
    };

    // Save the cloned shift
    const newShift = new Register(clonedShift);
    await newShift.save();

    res.json(newShift);
    req.app.get('io').emit('register', newShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all shifts
router.get('/all', async (req, res) => {
  try {
    const shifts = await Register.find();

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete shift
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShift = await Register.findByIdAndDelete(id);

    if (!deletedShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    const lastShift = await Register.findOne().sort({ _id: -1 }).limit(1);

    if (lastShift) {
      lastShift.status = 'current';
    }
    lastShift.save();

    res.json(lastShift);
    req.app.get('io').emit('register', lastShift);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//hello

export default router;
